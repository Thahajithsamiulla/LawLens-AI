# LawLens AI — Groq Multi-Model Legal Answer Verification (Step 8)

LawLens AI is an intelligent legal research platform. Step 8 implements an independent secondary verification layer using a model served through the Groq API (`llama-3.3-70b-versatile`), evaluating Gemini-generated legal answers, extracted claims, and citations against backend-retrieved evidence.

---

## 📁 Dataset Locations

The legal datasets are stored locally inside the project:
- **Bare Acts & Statutes**: `data/indian_laws_acts/` (`indian_law_bare_acts_dataset (1).parquet`)
- **Case Laws & Judgments**: `data/indian_case_laws/` (14 Parquet files for years 2015–2026)

All source dataset files are treated as **READ-ONLY**. Processing error logs are saved to `data/processed/ingestion_errors.log` and `data/processed/embedding_errors.log`.

---

## 🔍 1. Dataset Inspection Command

Inspect dataset formats, schema columns, record counts, text fields, and metadata without printing raw legal content:

```bash
python -m backend.scripts.inspect_datasets
```

---

## ⚡ 2. Dataset Ingestion Commands

```bash
# Ingest 100 Bare Acts
python -m backend.scripts.ingest_datasets --type laws --limit 100

# Ingest 100 Court Judgments
python -m backend.scripts.ingest_datasets --type judgments --limit 100

# Full ingestion
python -m backend.scripts.ingest_datasets --type all
```

---

## 🧠 3. Gemini Embedding Pipeline Commands (Step 4)

```bash
# Display embedding status summary
python -m backend.scripts.embed_chunks --status

# Generate embeddings for 50 pending chunks
python -m backend.scripts.embed_chunks --limit 50

# Validate stored vectors & model metadata
python -m backend.scripts.validate_embeddings
```

---

## 🗄️ 4. MongoDB Collections & Schema

- **`documents`**: Stores normalized legal documents (`LAW` and `JUDGMENT`). Indexed by unique `document_id`.
- **`chunks`**: Stores legal-aware text chunks and generated embedding vectors. Indexed by unique `chunk_id` and `document_id`.

### Embedded Chunk Schema
```json
{
  "chunk_id": "chunk-f1e2d3c4b5a67890",
  "document_id": "doc-law-a1b2c3d4e5f67890",
  "text": "The Aadhaar (Targeted Delivery of Financial and other Subsidies, Benefits and Services) Act, 2016...",
  "section": "1",
  "metadata": {
    "document_type": "LAW",
    "act_title": "Aadhaar Act, 2016",
    "section_number": "1",
    "chunk_index": 0,
    "total_chunks": 1
  },
  "embedding": [
    0.012345,
    -0.067890,
    "... 1536 float values ..."
  ],
  "embedding_model": "gemini-embedding-001",
  "embedding_dimension": 1536,
  "embedding_version": "v1",
  "embedded_at": "2026-09-05T00:12:10.958Z",
  "created_at": "2026-09-04T18:22:04.335Z"
}
```

---

## ⚙️ 5. Embedding Pipeline Design

- **Model**: `gemini-embedding-001` via Google GenAI SDK (`google-genai`).
- **Vector Dimension**: `EMBEDDING_DIMENSION = 1536` (strictly validated).
- **Task Types**:
  - `RETRIEVAL_DOCUMENT` for legal corpus chunks.
  - `RETRIEVAL_QUERY` for user queries.
- **Context Construction**: Formats metadata deterministically with chunk text (`ACT TITLE`, `SECTION`, `COURT`, `CASE TITLE`, `LEGAL TEXT`) without modifying the original chunk text stored in database.
- **Retry & Backoff**: Bounded retries with exponential backoff for transient API errors (max 3 attempts).
- **Idempotency**: Scopes updates to `embedding == null` to support stopping and resuming safely without re-embedding existing chunks.

---

## 🔍 6. MongoDB Atlas Vector Search & Retrieval API (Step 5)

- **Vector Search Index**: `lawlens_vector_index` (Cosine similarity, 1536D)
- **Filters Supported**: `document_type`, `court`, `decision_year`, `act_title`, `jurisdiction`
- **Endpoint**: `POST /api/retrieval/search` (and `/api/v1/retrieval/search`)

---

## 🤖 7. Gemini Legal RAG Reasoning Layer (Step 6)

- **Reasoning Model**: `gemini-3.6-flash` (configurable via `GEMINI_MODEL` / `GEMINI_REASONING_MODEL`)
- **Pipeline**: User Query $\rightarrow$ `RetrievalService` $\rightarrow$ Atlas `$vectorSearch` $\rightarrow$ Grounded Prompt Context $\rightarrow$ Gemini LLM Legal Reasoning $\rightarrow$ `RAGResponse`
- **Security Safeguards**:
  - Grounded reasoning exclusively using retrieved legal evidence chunks.
  - Prompt-injection defense: Retrieved documents tagged as `UNTRUSTED SOURCE DATA`.
  - Insufficient evidence short-circuiting: Zero retrieved chunks returns `status="insufficient_evidence"` **without calling Gemini API**.
- **Endpoint**: `POST /api/rag/answer` (and `/api/v1/rag/answer`)

---

## 📜 8. Citation Extraction & Evidence Mapping (Step 7)

- **Batched Extraction**: Extracts atomic legal claims (`LegalClaim`) and explicit legal references (`CitationReference`) in a single Gemini call.
- **Strict Evidence Validation**: Intersects extracted `evidence_ids` with retrieved `valid_chunk_ids` set to filter out hallucinated chunk IDs.
- **Support Status & Auto-Downgrade**: Claims marked `SUPPORTED` with zero valid evidence IDs auto-downgrade to `UNSUPPORTED` and are flagged in `limitations`.
- **Graceful Error Degradation**: Extraction errors fail silently to protect the Step 6 grounded answer.

---

## 🛡️ 9. Groq Multi-Model Verification Layer (Step 8)

- **Verification Model**: Configurable model via `GROQ_VERIFICATION_MODEL` (default: `llama-3.3-70b-versatile`).
- **Independent Evaluation**: Groq evaluates Gemini answers, claims, and citations without generating replacement answers.
- **Backend ID Validation**: Filters out hallucinated claim/citation/evidence IDs not present in backend sets.
- **Verification Control**: `verify: bool = True` in `RAGRequest` (setting `verify=False` skips Groq API calls).
- **CLI Verification**: `python -m backend.scripts.run_verification_test`
- **Pytest Verification**: `pytest` (72 passing backend tests)

---

## ⚠️ Scope Boundaries & Next Steps

> [!NOTE]
> Steps 1–8 are fully implemented and validated with 72 passing backend tests.
> React chat UI production code (Step 9) will be implemented in the next step.

