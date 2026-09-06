# LawLens AI — Step 7: Citation Extraction & Evidence Mapping Architecture

## 📌 Overview

The Citation Extraction & Evidence Mapping layer in **LawLens AI** turns synthesized RAG legal answers into traceable, auditable legal intelligence. It extracts atomic legal claims and explicit legal citations/references, validating every link against backend-retrieved evidence chunk IDs.

```text
User Question + Generated Answer + Retrieved Evidence
                         │
                         ▼
        CitationService.extract_claims_and_citations
                         │
                         ▼
             Batched Gemini Call (JSON)
                         │
                         ▼
           Strict Backend Validation & Filtering
  ├── Validate evidence_ids against retrieved chunk_id set
  ├── Validate claim_id references on citations
  └── Auto-downgrade status to UNSUPPORTED if 0 valid evidence IDs exist
                         │
                         ▼
           RAGResponse with claims & citations
```

---

## 🔍 Key Capabilities

1. **Atomic Claim Extraction**:
   - Deconstructs legal answers into standalone atomic statements.
   - Categorizes claim types: `STATUTORY_RULE`, `CASE_PRINCIPLE`, `CASE_HOLDING`, `PROCEDURAL_RULE`, `FACTUAL_STATEMENT`, `SYNTHESIS`, `OTHER`.

2. **Explicit Citation Extraction**:
   - Identifies statutory references, section numbers, case citations, and regulations explicitly stated in or inferred from the answer.
   - Categorizes citation types: `CASE`, `STATUTE`, `SECTION`, `REGULATION`, `OTHER`.

3. **Strict Backend Evidence Validation**:
   - Extracted `evidence_ids` are intersected with the `valid_chunk_ids` set retrieved from vector search.
   - Any LLM-hallucinated or synthetic chunk IDs are rejected at the backend level.

4. **Support Status & Auto-Downgrade**:
   - `support_status` options: `SUPPORTED`, `PARTIALLY_SUPPORTED`, `UNSUPPORTED`.
   - If a claim was marked `SUPPORTED` by LLM but has zero valid backend chunk IDs, it is **automatically downgraded** to `UNSUPPORTED`.
   - Unsupported claims trigger a warning in `limitations`: *"One or more generated legal claims could not be fully supported by the retrieved evidence."*

5. **Graceful Error Recovery**:
   - If citation extraction fails (network timeout, API error, malformed response), the system logs a warning and returns the original Step 6 grounded legal answer with empty `claims` and `citations` lists and a limitation note.

---

## 🌐 API Schema Extension

`POST /api/rag/answer` response includes:

```json
{
  "query": "What principles govern anticipatory bail under Section 438 CrPC?",
  "answer": "Under Section 438 CrPC, anticipatory bail is granted considering personal liberty under Article 21...",
  "claims": [
    {
      "claim_id": "claim-001",
      "claim_text": "Anticipatory bail under Section 438 CrPC aims to balance personal liberty with investigation needs.",
      "claim_type": "STATUTORY_RULE",
      "evidence_ids": ["chunk-law-001"],
      "support_status": "SUPPORTED"
    }
  ],
  "citations": [
    {
      "citation_id": "citation-001",
      "citation_text": "Section 438 of the Code of Criminal Procedure, 1973",
      "citation_type": "SECTION",
      "claim_id": "claim-001",
      "evidence_ids": ["chunk-law-001"]
    }
  ],
  "status": "grounded",
  "limitations": [],
  "disclaimer": "This output is for legal research assistance..."
}
```

---

## 🧪 Testing & Verification

Run CLI test script:
```bash
python -m backend.scripts.test_citations
```

Run pytest test suite:
```bash
pytest backend/tests/test_citations.py
```
