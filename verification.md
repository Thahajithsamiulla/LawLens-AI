# LawLens AI — Step 8: Groq Multi-Model Legal Answer Verification Architecture

## 📌 Overview

The Secondary Verification Layer in **LawLens AI** provides independent, multi-provider evaluation of RAG legal research answers using models served through the **Groq API** (`GROQ_VERIFICATION_MODEL`, default: `llama-3.3-70b-versatile`).

```text
User Question + RAG Request (verify=true)
                   │
                   ▼
  RetrievalService (Atlas Vector Search)
                   │
                   ▼
        Retrieved Legal Evidence
                   │
                   ▼
  Gemini Legal Reasoning (gemini-3.6-flash)
                   │
                   ▼
      Grounded Legal Answer Text
                   │
                   ▼
    CitationService (Claims & Citations)
                   │
                   ▼
 VerificationService + GroqVerificationService
                   │
                   ▼
       Batched Groq API Call (JSON)
                   │
                   ▼
 Strict Backend ID Validation & Filtering
  ├── Confirm claim_id in backend claim set
  ├── Confirm citation_id in backend citation set
  └── Filter evidence_ids against backend chunk set
                   │
                   ▼
 Overall Status Determination & Warning Checks
                   │
                   ▼
 Complete RAGResponse with Verification Envelope
```

---

## 🎯 Model Role Division: Gemini vs Groq

| Responsibility | Service / Provider | Model |
| :--- | :--- | :--- |
| **Grounded Legal Answer Generation** | `GeminiReasoningService` (Google GenAI) | `gemini-3.6-flash` |
| **Claim & Citation Extraction** | `CitationService` (Google GenAI) | `gemini-3.6-flash` |
| **Independent Answer & Evidence Verification** | `GroqVerificationService` (Groq API) | `llama-3.3-70b-versatile` |

> [!IMPORTANT]
> **Groq is the Verifier, NOT the Generator**: The Groq model is never asked to generate a replacement legal answer. It independently evaluates whether claims and citations made in the Gemini answer are directly supported by backend-retrieved legal evidence chunks.

---

## 🛡️ Verification Rules & Guardrails

1. **Verification Control Flag (`verify`)**:
   - `RAGRequest` accepts `verify: bool = True`.
   - When `verify=False`, the Groq API is **not called**, saving API quota.

2. **No-Evidence Short-Circuit**:
   - If vector retrieval yields zero evidence chunks (`status="insufficient_evidence"`), verification automatically returns `overall_status="UNVERIFIABLE"` **without calling the Groq API**.

3. **Strict Backend Identifier Validation**:
   - Every `claim_id`, `citation_id`, and `evidence_id` returned by Groq is validated against backend-controlled ID sets.
   - Any unknown/hallucinated ID is rejected, stripped out, and flagged with a warning.

4. **Overall Status Determination**:
   - `VERIFIED`: All claims have valid supporting evidence; no major citation mismatch.
   - `PARTIALLY_VERIFIED`: Some claims are supported, but one or more claims have partial or uncertain support.
   - `NOT_VERIFIED`: One or more major claims lack supporting evidence or contain unsupported assertions.
   - `UNVERIFIABLE`: Evidence is insufficient or verification failed/was skipped.

5. **Graceful Failure Degradation**:
   - If Groq encounters rate limits, network timeouts, API errors, or malformed JSON responses, the error is logged as a warning, and `verification` is populated with `overall_status="UNVERIFIABLE"` and a summary stating `"Secondary verification was unavailable."` The original Gemini grounded answer remains completely intact.

6. **Prompt Injection Defense**:
   - Retrieved legal evidence text is sandboxed as `UNTRUSTED SOURCE DATA`.
   - The Gemini answer is sandboxed as target text under evaluation.
   - Instructions contained within source text or target answer text are strictly ignored.

---

## 🌐 API Request & Response Schema Extension

### Endpoint: `POST /api/rag/answer`

#### Request JSON:
```json
{
  "query": "What principles govern anticipatory bail under Section 438 CrPC?",
  "top_k": 3,
  "verify": true
}
```

#### Response JSON:
```json
{
  "query": "What principles govern anticipatory bail under Section 438 CrPC?",
  "answer": "Under Section 438 of the Code of Criminal Procedure, 1973, anticipatory bail may be granted...",
  "claims": [
    {
      "claim_id": "claim-001",
      "claim_text": "Section 438 CrPC provides for anticipatory bail.",
      "claim_type": "STATUTORY_RULE",
      "evidence_ids": ["chunk-bail-001"],
      "support_status": "SUPPORTED"
    }
  ],
  "citations": [
    {
      "citation_id": "citation-001",
      "citation_text": "Section 438 CrPC",
      "citation_type": "SECTION",
      "claim_id": "claim-001",
      "evidence_ids": ["chunk-bail-001"]
    }
  ],
  "verification": {
    "overall_status": "VERIFIED",
    "summary": "All extracted legal claims and statutory citations are directly supported by the retrieved judgment text.",
    "claim_verifications": [
      {
        "claim_id": "claim-001",
        "status": "SUPPORTED",
        "reason": "The retrieved judgment explicitly discusses anticipatory bail under Section 438.",
        "evidence_ids": ["chunk-bail-001"]
      }
    ],
    "citation_verifications": [
      {
        "citation_id": "citation-001",
        "status": "SUPPORTED",
        "reason": "Section 438 CrPC is referenced in the evidence chunk.",
        "evidence_ids": ["chunk-bail-001"]
      }
    ],
    "warnings": []
  },
  "status": "grounded",
  "limitations": [],
  "disclaimer": "This output is for legal research assistance and is not a substitute for advice from a qualified legal professional."
}
```

---

## 🧪 Testing & Verification

Run CLI test script:
```bash
python -m backend.scripts.run_verification_test
```

Run pytest test suite:
```bash
pytest backend/tests/test_verification.py
```

Run full backend test suite:
```bash
pytest
```
