# LawLens AI — Full Runtime Diagnostic Report

## Executive Summary
This document provides a trace of the execution path for `POST /api/rag/answer` in the LawLens AI application, identifying the root cause of the `"Insufficient Grounding Evidence"` warning and proposing corrective actions.

---

## Complete Request Execution Path

```
[USER] 
  │ (Submits legal question in UI)
  ▼
[REACT FRONTEND] 
  │ (POST /api/rag/answer with JSON: { "query": "...", "top_k": 5, "verify": true })
  ▼
[FASTAPI BACKEND] 
  │ (app/api/v1/rag.py -> RAGRequest validation)
  ▼
[RAG ORCHESTRATOR] 
  │ (app/services/rag.py -> generate_rag_answer)
  ▼
[GEMINI QUERY EMBEDDING] 
  │ (app/services/embeddings.py -> embed_query -> google-genai SDK)
  │ (Task: RETRIEVAL_QUERY, Model: gemini-embedding-001, Dimension: 1536)
  ▼
[MONGODB ATLAS VECTOR SEARCH] 
  │ (app/services/retrieval.py & app/db/mongodb.py -> vector_search_chunks)
  │ ❌ FAIL STAGE: 
  │    - MONGODB_URI in .env pointed to localhost:27017 where no live MongoDB daemon was running.
  │    - db_manager fell back to in-memory mode with 0 ingested chunks.
  │    - Vector search returned 0 matching results (results = []).
  ▼
[GROUNDING SHORT-CIRCUIT] 
  │ (rag.py line 162 detects empty results -> returns RAGResponse with status="insufficient_evidence")
  ▼
[REACT RENDERING] 
  │ (MessageItem displays "Insufficient Grounding Evidence", EvidencePanel displays "No evidence was returned.")
  │ ❌ MISLEADING UI: Header reported "Research Services Ready" because health check only validated string presence of keys.
```

---

## Root Cause Analysis

1. **Database Fallback & Empty Corpus**:
   - `db_manager` falls back to an in-memory dictionary when `mongodb://localhost:27017` is unreachable.
   - In in-memory mode, no statutory acts or judgments were ingested, leading to zero vector search matches for any legal question.

2. **Misleading Readiness Reporting**:
   - `/api/health/dependencies` checked if `MONGODB_URI` string was present and `GEMINI_API_KEY` was populated, but did NOT check if the database was actually connected to a live collection with indexed vector chunks.

3. **Grounded RAG Pipeline Behavioral Safeguard**:
   - Grounding rules strictly prevent Gemini from hallucinating legal answers when zero evidence chunks are retrieved. Thus, the system correctly short-circuited to `insufficient_evidence`.

---

## Required Recovery Actions

1. **Database Connectivity & Dataset Seeding**:
   - Ensure MongoDB is connected to a live database or seed the in-memory fallback layer during startup with real legal chunks (Companies Act, 2013, IPC, CrPC, etc.) when running in local dev mode.
   - Support running `ingest_datasets.py` and `embed_chunks.py` or pre-seeding core statutory sections.

2. **Readiness Check Accuracy**:
   - Update `/api/health/dependencies` to verify that chunk collections are accessible and vector search is operational before displaying `"Research Services Ready"`.

3. **E2E Pipeline Verification**:
   - Verify query embedding (1536D) -> vector retrieval -> Gemini reasoning -> Groq verification end-to-end.
