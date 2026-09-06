import logging
import uuid
import datetime
import math
from typing import Optional, List, Dict, Any
from app.core.config import settings

logger = logging.getLogger("lawlens.db")

class MongoDBManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.is_mock = False
        self._in_memory_docs: Dict[str, Dict[str, Any]] = {}
        self._in_memory_chunks: Dict[str, Dict[str, Any]] = {}
        self._in_memory_queries: Dict[str, Dict[str, Any]] = {}
        self._in_memory_sessions: Dict[str, Dict[str, Any]] = {}

    async def connect(self):
        """
        Connect to MongoDB using Motor async driver.
        If MongoDB is unreachable, log warning and initialize fallback layer for development/testing.
        """
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            # Connect with server selection timeout of 3 seconds
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=3000
            )
            self.db = self.client[settings.DATABASE_NAME]
            # Ping database to verify active connection
            await self.client.admin.command('ping')
            logger.info(f"Connected to MongoDB database '{settings.DATABASE_NAME}' at {settings.MONGODB_URI}")
            
            # Ensure indexes
            await self._create_indexes()
            self.is_mock = False
            await self.seed_core_corpus_if_empty()
        except Exception as e:
            logger.warning(f"MongoDB connection to {settings.MONGODB_URI} unavailable ({e}). Using in-memory database fallback for development/testing.")
            self.is_mock = True
            self.client = None
            self.db = None
            await self.seed_core_corpus_if_empty()

    async def seed_core_corpus_if_empty(self):
        """
        Ensures authoritative Indian statutory acts and precedent chunks with 1536D vectors
        are populated into the database / fallback store.
        """
        status = await self.get_embedding_status()
        if status.get("total_chunks", 0) > 0:
            return

        logger.info("Initializing core legal statutory & precedent corpus into vector store...")
        from app.services.embeddings import embedding_service
        
        CORE_DATASETS = [
            {
                "doc": {
                    "document_id": "doc-statute-companies-act-2013",
                    "title": "Companies Act, 2013",
                    "document_type": "LAW",
                    "jurisdiction": "India",
                    "source": "Ministry of Corporate Affairs",
                    "metadata": {"act_title": "Companies Act, 2013", "year": 2013}
                },
                "chunks": [
                    {
                        "chunk_id": "chunk-statute-comp166",
                        "text": "Companies Act, 2013\nSection 166: Duties of directors.\n(1) Subject to the provisions of this Act, a director of a company shall act in accordance with the articles of the company.\n(2) A director of a company shall act in good faith in order to promote the objects of the company for the benefit of its members as a whole, and in the best interests of the company, its employees, the shareholders, the community and for the protection of environment.\n(3) A director of a company shall exercise his duties with due and reasonable care, skill and diligence and shall exercise independent judgment.\n(4) A director of a company shall not involve in a situation in which he may have a direct or indirect interest that conflicts, or possibly may conflict, with the interest of the company.\n(5) A director of a company shall not achieve or attempt to achieve any undue gain or advantage either to himself or to his relatives, partners, or associates and if such director is found guilty of making any undue gain, he shall be liable to pay an amount equal to that gain to the company.\n(6) A director of a company shall not assign his office and any assignment so made shall be void.\n(7) If a director of the company contravenes the provisions of this section such director shall be punishable with fine which shall not be less than one lakh rupees but which may extend to five lakh rupees.",
                        "section": "166",
                        "metadata": {
                            "document_type": "LAW",
                            "act_title": "Companies Act, 2013",
                            "section_number": "166",
                            "year": 2013
                        }
                    }
                ]
            },
            {
                "doc": {
                    "document_id": "doc-statute-ipc-1860",
                    "title": "Indian Penal Code, 1860",
                    "document_type": "LAW",
                    "jurisdiction": "India",
                    "source": "Bare Acts",
                    "metadata": {"act_title": "Indian Penal Code, 1860", "year": 1860}
                },
                "chunks": [
                    {
                        "chunk_id": "chunk-statute-ipc302",
                        "text": "Indian Penal Code, 1860\nSection 302: Punishment for murder.\nWhoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine.",
                        "section": "302",
                        "metadata": {
                            "document_type": "LAW",
                            "act_title": "Indian Penal Code, 1860",
                            "section_number": "302",
                            "year": 1860
                        }
                    }
                ]
            },
            {
                "doc": {
                    "document_id": "doc-statute-crpc-1973",
                    "title": "Code of Criminal Procedure, 1973",
                    "document_type": "LAW",
                    "jurisdiction": "India",
                    "source": "Bare Acts",
                    "metadata": {"act_title": "Code of Criminal Procedure, 1973", "year": 1973}
                },
                "chunks": [
                    {
                        "chunk_id": "chunk-statute-crpc438",
                        "text": "Code of Criminal Procedure, 1973\nSection 438: Direction for grant of bail to person apprehending arrest.\n(1) Where any person has reason to believe that he may be arrested on accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction under this section that in the event of such arrest he shall be released on bail.\n(2) When the High Court or the Court of Session makes a direction under sub-section (1), it may include such conditions as it may think fit, including condition that the person shall make himself available for interrogation by a police officer.",
                        "section": "438",
                        "metadata": {
                            "document_type": "LAW",
                            "act_title": "Code of Criminal Procedure, 1973",
                            "section_number": "438",
                            "year": 1973
                        }
                    }
                ]
            },
            {
                "doc": {
                    "document_id": "doc-statute-constitution-art21",
                    "title": "Constitution of India",
                    "document_type": "LAW",
                    "jurisdiction": "India",
                    "source": "Constitutional Law",
                    "metadata": {"act_title": "Constitution of India", "year": 1950}
                },
                "chunks": [
                    {
                        "chunk_id": "chunk-statute-const21",
                        "text": "Constitution of India\nArticle 21: Protection of life and personal liberty.\nNo person shall be deprived of his life or personal liberty except according to procedure established by law. The Supreme Court in K.S. Puttaswamy v. Union of India affirmed that Article 21 encompasses the fundamental right to privacy as an intrinsic part of personal liberty.",
                        "section": "Article 21",
                        "metadata": {
                            "document_type": "LAW",
                            "act_title": "Constitution of India",
                            "section_number": "Article 21",
                            "year": 1950
                        }
                    }
                ]
            },
            {
                "doc": {
                    "document_id": "doc-judgment-salomon-1897",
                    "title": "Salomon v A Salomon & Co Ltd",
                    "document_type": "JUDGMENT",
                    "jurisdiction": "Common Law Precedents",
                    "source": "House of Lords",
                    "metadata": {"case_title": "Salomon v A Salomon & Co Ltd", "court": "House of Lords", "year": 1897}
                },
                "chunks": [
                    {
                        "chunk_id": "chunk-judgment-salomon",
                        "text": "Salomon v. A Salomon & Co Ltd [1897] AC 22\nRatio Decidendi: The House of Lords established that a company is a separate legal entity distinct from its members and directors. The corporate veil may only be pierced in exceptional circumstances involving fraud, sham transactions, or evasion of legal obligations.",
                        "metadata": {
                            "document_type": "JUDGMENT",
                            "case_title": "Salomon v A Salomon & Co Ltd",
                            "court": "House of Lords",
                            "year": 1897,
                            "citation": "[1897] AC 22"
                        }
                    }
                ]
            },
            {
                "doc": {
                    "document_id": "doc-judgment-mcmehta-1987",
                    "title": "M.C. Mehta v. Union of India",
                    "document_type": "JUDGMENT",
                    "jurisdiction": "India",
                    "source": "Supreme Court Reports",
                    "metadata": {"case_title": "M.C. Mehta v. Union of India", "court": "Supreme Court of India", "year": 1987}
                },
                "chunks": [
                    {
                        "chunk_id": "chunk-judgment-mcmehta",
                        "text": "M.C. Mehta v. Union of India 1987 AIR 1086\nRatio Decidendi: The Supreme Court of India laid down the rule of Absolute Liability for enterprises engaged in hazardous or inherently dangerous industries. The Court held that such enterprises owe an absolute, non-delegable duty to the community, and liability cannot be avoided by claiming exceptions under Rylands v. Fletcher.",
                        "metadata": {
                            "document_type": "JUDGMENT",
                            "case_title": "M.C. Mehta v. Union of India",
                            "court": "Supreme Court of India",
                            "year": 1987,
                            "citation": "1987 AIR 1086"
                        }
                    }
                ]
            }
        ]

        docs_to_insert = []
        chunks_to_insert = []

        for item in CORE_DATASETS:
            docs_to_insert.append(item["doc"])
            for chunk in item["chunks"]:
                chunk_record = {
                    "chunk_id": chunk["chunk_id"],
                    "document_id": item["doc"]["document_id"],
                    "text": chunk["text"],
                    "section": chunk.get("section"),
                    "metadata": chunk.get("metadata", {}),
                    "embedding": None
                }
                try:
                    if settings.GEMINI_API_KEY:
                        embed_text = embedding_service.construct_embedding_text(chunk_record)
                        vector = embedding_service.embed_document(embed_text)
                        chunk_record["embedding"] = vector
                        chunk_record["embedding_model"] = settings.GEMINI_EMBEDDING_MODEL
                        chunk_record["embedding_dimension"] = len(vector)
                except Exception as e:
                    logger.warning(f"Failed to generate seed embedding for chunk {chunk['chunk_id']}: {e}")

                chunks_to_insert.append(chunk_record)

        await self.bulk_upsert_documents(docs_to_insert)
        await self.bulk_upsert_chunks(chunks_to_insert)
        logger.info(f"Seeded {len(docs_to_insert)} core legal documents and {len(chunks_to_insert)} vector chunks.")

    async def _create_indexes(self):
        if self.db is not None:
            try:
                await self.db.documents.create_index("document_id", unique=True)
                await self.db.chunks.create_index("chunk_id", unique=True)
                await self.db.chunks.create_index("document_id")
                await self.db.research_queries.create_index("query_id", unique=True)
                logger.info("MongoDB indexes created successfully.")
            except Exception as e:
                logger.error(f"Failed to create MongoDB indexes: {e}")

    async def disconnect(self):
        if self.client:
            self.client.close()
            logger.info("Closed MongoDB client connection.")

    # -------------------------------------------------------------------------
    # DOCUMENT CRUD OPERATIONS
    # -------------------------------------------------------------------------
    async def create_document(self, doc_data: dict) -> dict:
        doc_id = f"doc-{uuid.uuid4().hex[:12]}"
        now_iso = datetime.datetime.utcnow().isoformat() + "Z"
        
        record = {
            "document_id": doc_id,
            "title": doc_data["title"],
            "document_type": doc_data["document_type"],
            "jurisdiction": doc_data["jurisdiction"],
            "source": doc_data["source"],
            "source_url": doc_data.get("source_url"),
            "description": doc_data.get("description"),
            "publication_date": doc_data.get("publication_date"),
            "created_at": now_iso,
            "metadata": doc_data.get("metadata", {})
        }

        if self.is_mock or self.db is None:
            self._in_memory_docs[doc_id] = record
            return record

        await self.db.documents.insert_one(record.copy())
        return record

    async def get_documents(self, limit: int = 50, skip: int = 0) -> List[dict]:
        if self.is_mock or self.db is None:
            docs = list(self._in_memory_docs.values())
            return docs[skip:skip+limit]

        cursor = self.db.documents.find({}, {"_id": 0}).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    async def get_document_by_id(self, document_id: str) -> Optional[dict]:
        if self.is_mock or self.db is None:
            return self._in_memory_docs.get(document_id)

        return await self.db.documents.find_one({"document_id": document_id}, {"_id": 0})

    async def delete_document(self, document_id: str) -> bool:
        if self.is_mock or self.db is None:
            if document_id in self._in_memory_docs:
                del self._in_memory_docs[document_id]
                # Cascade delete chunks
                chunk_ids_to_del = [
                    cid for cid, chunk in self._in_memory_chunks.items()
                    if chunk["document_id"] == document_id
                ]
                for cid in chunk_ids_to_del:
                    del self._in_memory_chunks[cid]
                return True
            return False

        res = await self.db.documents.delete_one({"document_id": document_id})
        if res.deleted_count > 0:
            # Cascade delete associated chunks
            await self.db.chunks.delete_many({"document_id": document_id})
            return True
        return False

    # -------------------------------------------------------------------------
    # CHUNK CRUD OPERATIONS
    # -------------------------------------------------------------------------
    async def create_chunk(self, document_id: str, chunk_data: dict) -> dict:
        chunk_id = f"chunk-{uuid.uuid4().hex[:12]}"
        now_iso = datetime.datetime.utcnow().isoformat() + "Z"

        record = {
            "chunk_id": chunk_id,
            "document_id": document_id,
            "text": chunk_data["text"],
            "section": chunk_data.get("section"),
            "article": chunk_data.get("article"),
            "page": chunk_data.get("page"),
            "metadata": chunk_data.get("metadata", {}),
            "embedding": None,  # Nullable for Step 2
            "created_at": now_iso
        }

        if self.is_mock or self.db is None:
            self._in_memory_chunks[chunk_id] = record
            return record

        await self.db.chunks.insert_one(record.copy())
        return record

    async def get_chunks_by_document_id(self, document_id: str) -> List[dict]:
        if self.is_mock or self.db is None:
            return [
                chunk for chunk in self._in_memory_chunks.values()
                if chunk["document_id"] == document_id
            ]

        cursor = self.db.chunks.find({"document_id": document_id}, {"_id": 0})
        return await cursor.to_list(length=500)

    # -------------------------------------------------------------------------
    # RESEARCH QUERY OPERATIONS
    # -------------------------------------------------------------------------
    async def create_research_query(self, query_data: dict) -> dict:
        query_id = f"query-{uuid.uuid4().hex[:12]}"
        now_iso = datetime.datetime.utcnow().isoformat() + "Z"

        record = {
            "query_id": query_id,
            "question": query_data["question"],
            "created_at": now_iso,
            "metadata": query_data.get("metadata", {})
        }

        if self.is_mock or self.db is None:
            self._in_memory_queries[query_id] = record
            return record

        await self.db.research_queries.insert_one(record.copy())
        return record

    # -------------------------------------------------------------------------
    # RESEARCH SESSION PERSISTENCE OPERATIONS
    # -------------------------------------------------------------------------
    async def create_session(self, title: str = "New Research", initial_query: str = "") -> dict:
        session_id = f"session-{uuid.uuid4().hex[:12]}"
        now_iso = datetime.datetime.utcnow().isoformat() + "Z"

        record = {
            "session_id": session_id,
            "title": title or (initial_query[:40] + "..." if len(initial_query) > 40 else initial_query) or "New Research",
            "initial_query": initial_query,
            "created_at": now_iso,
            "updated_at": now_iso,
            "messages": [],
            "evidence": [],
            "verification_status": "PENDING"
        }

        if self.is_mock or self.db is None:
            self._in_memory_sessions[session_id] = record
            return record

        await self.db.research_sessions.insert_one(record.copy())
        return record

    async def get_sessions(self, limit: int = 50, skip: int = 0) -> List[dict]:
        if self.is_mock or self.db is None:
            sessions = list(self._in_memory_sessions.values())
            sessions.sort(key=lambda s: s.get("updated_at", ""), reverse=True)
            return sessions[skip:skip+limit]

        cursor = self.db.research_sessions.find({}, {"_id": 0}).sort("updated_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    async def get_session_by_id(self, session_id: str) -> Optional[dict]:
        if self.is_mock or self.db is None:
            return self._in_memory_sessions.get(session_id)

        return await self.db.research_sessions.find_one({"session_id": session_id}, {"_id": 0})

    async def add_message_to_session(
        self,
        session_id: str,
        user_message: dict,
        assistant_message: Optional[dict] = None,
        evidence: Optional[List[dict]] = None,
        verification_status: Optional[str] = None
    ) -> Optional[dict]:
        now_iso = datetime.datetime.utcnow().isoformat() + "Z"

        session = await self.get_session_by_id(session_id)
        if not session:
            # Auto-create session if not found
            title = user_message.get("text", "New Research")[:45]
            session = await self.create_session(title=title, initial_query=user_message.get("text", ""))
            session_id = session["session_id"]

        messages = session.get("messages", [])
        if user_message:
            messages.append(user_message)
        if assistant_message:
            messages.append(assistant_message)

        # Update title if title is generic and this is initial user message
        title = session.get("title")
        if (title == "New Research" or not title) and user_message.get("text"):
            q_text = user_message["text"]
            title = q_text[:45] + "..." if len(q_text) > 45 else q_text

        update_data = {
            "title": title,
            "messages": messages,
            "updated_at": now_iso
        }
        if evidence is not None:
            update_data["evidence"] = evidence
        if verification_status is not None:
            update_data["verification_status"] = verification_status

        if self.is_mock or self.db is None:
            if session_id in self._in_memory_sessions:
                self._in_memory_sessions[session_id].update(update_data)
                return self._in_memory_sessions[session_id]
            return None

        await self.db.research_sessions.update_one(
            {"session_id": session_id},
            {"$set": update_data}
        )
        return await self.get_session_by_id(session_id)

    async def delete_session(self, session_id: str) -> bool:
        if self.is_mock or self.db is None:
            if session_id in self._in_memory_sessions:
                del self._in_memory_sessions[session_id]
                return True
            return False

        res = await self.db.research_sessions.delete_one({"session_id": session_id})
        return res.deleted_count > 0

    # -------------------------------------------------------------------------
    # BULK / UPSERT OPERATIONS FOR INGESTION
    # -------------------------------------------------------------------------
    async def bulk_upsert_documents(self, documents: List[dict]) -> dict:
        """
        Upsert a batch of documents using document_id as unique key.
        Returns dict with count of inserted, updated, skipped.
        """
        if not documents:
            return {"inserted": 0, "updated": 0, "skipped": 0}

        now_iso = datetime.datetime.utcnow().isoformat() + "Z"
        for doc in documents:
            if "created_at" not in doc:
                doc["created_at"] = now_iso

        if self.is_mock or self.db is None:
            inserted = 0
            updated = 0
            for doc in documents:
                doc_id = doc["document_id"]
                if doc_id in self._in_memory_docs:
                    self._in_memory_docs[doc_id] = doc
                    updated += 1
                else:
                    self._in_memory_docs[doc_id] = doc
                    inserted += 1
            return {"inserted": inserted, "updated": updated, "skipped": 0}

        from pymongo import ReplaceOne
        operations = [
            ReplaceOne({"document_id": doc["document_id"]}, doc, upsert=True)
            for doc in documents
        ]
        result = await self.db.documents.bulk_write(operations, ordered=False)
        inserted = len(result.upserted_ids) if result.upserted_ids else 0
        updated = result.modified_count if result.modified_count else 0
        skipped = len(documents) - (inserted + updated)
        if skipped < 0:
            skipped = 0
        return {"inserted": inserted, "updated": updated, "skipped": skipped}

    async def bulk_upsert_chunks(self, chunks: List[dict]) -> dict:
        """
        Upsert a batch of chunks using chunk_id as unique key.
        Returns dict with count of inserted, updated.
        """
        if not chunks:
            return {"inserted": 0, "updated": 0}

        now_iso = datetime.datetime.utcnow().isoformat() + "Z"
        for chunk in chunks:
            if "created_at" not in chunk:
                chunk["created_at"] = now_iso
            if "embedding" not in chunk:
                chunk["embedding"] = None

        if self.is_mock or self.db is None:
            inserted = 0
            updated = 0
            for chunk in chunks:
                cid = chunk["chunk_id"]
                if cid in self._in_memory_chunks:
                    self._in_memory_chunks[cid] = chunk
                    updated += 1
                else:
                    self._in_memory_chunks[cid] = chunk
                    inserted += 1
            return {"inserted": inserted, "updated": updated}

        from pymongo import ReplaceOne
        operations = [
            ReplaceOne({"chunk_id": chunk["chunk_id"]}, chunk, upsert=True)
            for chunk in chunks
        ]
        result = await self.db.chunks.bulk_write(operations, ordered=False)
        inserted = len(result.upserted_ids) if result.upserted_ids else 0
        updated = result.modified_count if result.modified_count else 0
        return {"inserted": inserted, "updated": updated}

    # -------------------------------------------------------------------------
    # EMBEDDING SPECIFIC OPERATIONS
    # -------------------------------------------------------------------------
    async def get_unembedded_chunks(self, limit: int = 50, force: bool = False) -> List[dict]:
        """
        Retrieves pending chunks where embedding is null (or all chunks if force=True).
        """
        if self.is_mock or self.db is None:
            chunks = list(self._in_memory_chunks.values())
            if not force:
                chunks = [c for c in chunks if c.get("embedding") is None]
            return chunks[:limit]

        query = {} if force else {"embedding": None}
        cursor = self.db.chunks.find(query, {"_id": 0}).limit(limit)
        return await cursor.to_list(length=limit)

    async def update_chunk_embedding(
        self,
        chunk_id: str,
        embedding: List[float],
        model: str = None,
        dimension: int = None,
        version: str = None
    ) -> bool:
        """
        Updates a chunk with its generated embedding vector and metadata.
        """
        model = model or settings.GEMINI_EMBEDDING_MODEL
        dimension = dimension or settings.EMBEDDING_DIMENSION
        version = version or settings.EMBEDDING_VERSION
        now_iso = datetime.datetime.utcnow().isoformat() + "Z"

        update_fields = {
            "embedding": embedding,
            "embedding_model": model,
            "embedding_dimension": dimension,
            "embedding_version": version,
            "embedded_at": now_iso
        }

        if self.is_mock or self.db is None:
            if chunk_id in self._in_memory_chunks:
                self._in_memory_chunks[chunk_id].update(update_fields)
                return True
            return False

        res = await self.db.chunks.update_one(
            {"chunk_id": chunk_id},
            {"$set": update_fields}
        )
        return res.modified_count > 0 or res.matched_count > 0

    async def get_embedding_status(self) -> dict:
        """
        Returns summary statistics of chunk embedding status in the database.
        """
        if self.is_mock or self.db is None:
            total = len(self._in_memory_chunks)
            embedded = sum(1 for c in self._in_memory_chunks.values() if c.get("embedding") is not None)
            pending = total - embedded
            return {
                "total_chunks": total,
                "embedded_chunks": embedded,
                "pending_chunks": pending,
                "failed_chunks": 0,
                "embedding_model": settings.GEMINI_EMBEDDING_MODEL,
                "embedding_dimension": settings.EMBEDDING_DIMENSION,
                "embedding_version": settings.EMBEDDING_VERSION
            }

        total = await self.db.chunks.count_documents({})
        embedded = await self.db.chunks.count_documents({"embedding": {"$ne": None}})
        pending = total - embedded
        return {
            "total_chunks": total,
            "embedded_chunks": embedded,
            "pending_chunks": pending,
            "failed_chunks": 0,
            "embedding_model": settings.GEMINI_EMBEDDING_MODEL,
            "embedding_dimension": settings.EMBEDDING_DIMENSION,
            "embedding_version": settings.EMBEDDING_VERSION
        }

    async def vector_search_chunks(
        self,
        query_vector: List[float],
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None,
        num_candidates: int = None
    ) -> List[dict]:
        """
        Executes MongoDB Atlas $vectorSearch pipeline over chunks collection.
        In mock unit test mode, calculates cosine similarity over stored memory chunks.
        """
        num_candidates = num_candidates or settings.VECTOR_NUM_CANDIDATES
        top_k = min(max(1, top_k), settings.MAX_TOP_K)

        if self.is_mock or self.db is None:
            # Mock cosine similarity search for unit tests
            results = []
            for chunk in self._in_memory_chunks.values():
                vec = chunk.get("embedding")
                if vec is None or not isinstance(vec, list) or len(vec) != len(query_vector):
                    continue

                meta = chunk.get("metadata", {})
                # Apply filters in mock mode
                if filters:
                    if "document_type" in filters and filters["document_type"]:
                        dt = filters["document_type"]
                        chunk_dt = meta.get("document_type") or chunk.get("document_type")
                        if isinstance(dt, list):
                            if chunk_dt not in dt:
                                continue
                        elif chunk_dt != dt:
                            continue
                    if "court" in filters and filters["court"] and meta.get("court") != filters["court"]:
                        continue
                    if "act_title" in filters and filters["act_title"] and meta.get("act_title") != filters["act_title"]:
                        continue
                    if "jurisdiction" in filters and filters["jurisdiction"] and meta.get("jurisdiction") != filters["jurisdiction"]:
                        continue
                    if "decision_year" in filters and filters["decision_year"] and meta.get("year") != filters["decision_year"]:
                        continue
                    if "year" in filters and filters["year"] and meta.get("year") != filters["year"]:
                        continue

                # Cosine similarity score
                dot = sum(a * b for a, b in zip(query_vector, vec))
                norm_a = math.sqrt(sum(a * a for a in query_vector))
                norm_b = math.sqrt(sum(b * b for b in vec))
                score = round(dot / (norm_a * norm_b), 4) if norm_a > 0 and norm_b > 0 else 0.0

                item = {
                    "chunk_id": chunk["chunk_id"],
                    "document_id": chunk["document_id"],
                    "text": chunk["text"],
                    "section": chunk.get("section"),
                    "article": chunk.get("article"),
                    "page": chunk.get("page"),
                    "metadata": meta,
                    "score": score
                }
                results.append(item)

            results.sort(key=lambda x: x["score"], reverse=True)
            return results[:top_k]

        # Live MongoDB Atlas $vectorSearch
        filter_doc = {}
        if filters:
            if "document_type" in filters and filters["document_type"]:
                dt = filters["document_type"]
                filter_doc["metadata.document_type"] = {"$in": dt} if isinstance(dt, list) else dt
            if "court" in filters and filters["court"]:
                filter_doc["metadata.court"] = filters["court"]
            if "act_title" in filters and filters["act_title"]:
                filter_doc["metadata.act_title"] = filters["act_title"]
            if "jurisdiction" in filters and filters["jurisdiction"]:
                filter_doc["metadata.jurisdiction"] = filters["jurisdiction"]
            if "decision_year" in filters and filters["decision_year"]:
                filter_doc["metadata.year"] = filters["decision_year"]
            elif "year" in filters and filters["year"]:
                filter_doc["metadata.year"] = filters["year"]

        vector_search_stage = {
            "$vectorSearch": {
                "index": settings.MONGODB_VECTOR_INDEX,
                "path": "embedding",
                "queryVector": query_vector,
                "numCandidates": num_candidates,
                "limit": top_k
            }
        }
        if filter_doc:
            vector_search_stage["$vectorSearch"]["filter"] = filter_doc

        project_stage = {
            "$project": {
                "_id": 0,
                "chunk_id": 1,
                "document_id": 1,
                "text": 1,
                "section": 1,
                "article": 1,
                "page": 1,
                "metadata": 1,
                "embedding_model": 1,
                "embedding_dimension": 1,
                "score": { "$meta": "vectorSearchScore" }
            }
        }

        try:
            cursor = self.db.chunks.aggregate([vector_search_stage, project_stage])
            return await cursor.to_list(length=top_k)
        except Exception as e:
            logger.error(f"MongoDB Vector Search failed: {e}")
            raise RuntimeError(
                f"MongoDB Vector Search index '{settings.MONGODB_VECTOR_INDEX}' is not configured or unavailable on database ({e})."
            )

# Singleton database manager instance
db_manager = MongoDBManager()
