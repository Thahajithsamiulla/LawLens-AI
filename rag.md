# LawLens AI — Step 6: Gemini Legal RAG Reasoning Architecture

## 📌 Architecture Overview

The Legal Retrieval-Augmented Generation (RAG) layer in **LawLens AI** orchestrates semantic vector retrieval with Gemini legal reasoning models (`gemini-3.6-flash`). It synthesizes retrieved legal document chunks into strictly grounded legal research answers.

```text
User Question (RAGRequest)
         │
         ▼
RetrievalService (RetrievalService.retrieve)
         │
         ▼
MongoDB Atlas Vector Search ($vectorSearch)
         │
         ▼
Top-K Relevant Legal Evidence Chunks (SearchResultItem)
         │
         ▼
Check Usable Evidence Exists?
  ├── NO (count == 0) ──► Return RAGResponse (status = "insufficient_evidence", NO Gemini call)
  └── YES (count > 0) ──► Construct Grounded Prompt Window (Untrusted Data Sandbox)
                                   │
                                   ▼
                         GeminiReasoningService (Gemini API)
                                   │
                                   ▼
                         Structured Legal Research Output (RAGResponse)
```

---

## 🛡️ Grounding Rules & Prompt Injection Safeguards

1. **Strict Grounding Enforcement**:
   - The model must answer using **ONLY** the retrieved legal evidence supplied in the context window.
   - Outside knowledge to fill gaps or invention of Acts, statutes, sections, case names, judgments, precedents, holdings, or dates is strictly prohibited.
   - The model explicitly distinguishes supported facts, synthesis of multiple sources, and unestablished matters.

2. **Untrusted Data Sandbox (Prompt Injection Defense)**:
   - Retrieved legal document text is explicitly tagged as `UNTRUSTED SOURCE DATA`.
   - System instructions take absolute priority. If a retrieved document contains adversarial instructions (e.g. `"Ignore previous instructions..."`), Gemini treats it purely as source text.

3. **Insufficient Evidence Short-Circuit**:
   - If `RetrievalService` returns zero results (`count == 0`), the pipeline returns `status = "insufficient_evidence"` immediately **without calling the Gemini API**.

---

## 🌐 API Endpoint Specification

### Endpoint: `POST /api/rag/answer` (and `POST /api/v1/rag/answer`)

#### Request JSON (`RAGRequest`):
```json
{
  "query": "What principles govern anticipatory bail under Section 438 CrPC?",
  "top_k": 5,
  "filters": {
    "document_type": "JUDGMENT"
  }
}
```

#### Response JSON (`RAGResponse`):
```json
{
  "query": "What principles govern anticipatory bail under Section 438 CrPC?",
  "answer": "Under Section 438 of the Code of Criminal Procedure, 1973, anticipatory bail is granted considering personal liberty and investigation requirements...",
  "key_points": [
    "Personal liberty under Article 21",
    "Cooperation with investigating officers"
  ],
  "evidence": [
    {
      "chunk_id": "chunk-jgm-001",
      "document_id": "doc-jgm-100",
      "document_type": "JUDGMENT",
      "title": "State v. Gurbaksh Singh Sibbia",
      "court": "Supreme Court of India",
      "year": 1980,
      "section_number": null,
      "score": 0.92
    }
  ],
  "status": "grounded",
  "limitations": [],
  "disclaimer": "This output is for legal research assistance and is not a substitute for advice from a qualified legal professional."
}
```

---

## 🧪 RAG Development Test Script

Run the development test script against the active system:

```bash
python -m backend.scripts.test_rag_pipeline
```

The script outputs:
- User research query
- Number of retrieved evidence chunks
- Document titles and courts
- Gemini-generated grounded answer
- Key takeaway points
- Limitations and disclaimer

---

## ⚙️ Configuration Settings

- `GEMINI_MODEL` / `GEMINI_REASONING_MODEL`: Configurable Gemini model name (default: `gemini-3.6-flash`).
- `RAG_MAX_CONTEXT_CHUNKS`: Maximum retrieved chunks included in RAG context window (default: `5`).
