# LawLens AI — Deployment Readiness Guide

This guide details the deployment architecture, configuration requirements, environment setup, and operational considerations for **LawLens AI** (Indian Legal Case Intelligence Platform).

---

## 1. System Architecture

```
User Browser
    ↓
React Frontend (Vite Static Build / Port 5173 or Nginx)
    ↓ HTTP REST API
FastAPI Backend Server (Uvicorn / Port 8000)
    ↓
┌───────────────────┬───────────────────┬───────────────────┐
│ Gemini Embeddings │ MongoDB Atlas     │ Groq Verification │
│ (1536-dim vectors)│ (Vector Search)   │ (Llama-3.3 70B)   │
└───────────────────┴───────────────────┴───────────────────┘
```

---

## 2. Backend Deployment Setup

### Environment Variables (`backend/.env`)
Create `.env` file inside `backend/` with the following variables:

```env
# Server Configuration
PROJECT_NAME="LawLens AI - Indian Legal Case Intelligence Platform"
ENVIRONMENT="production"
DEBUG=False
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000", "https://yourdomain.com"]

# Database & Vector Search
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/lawlens?retryWrites=true&w=majority"
MONGODB_DB_NAME="lawlens"
DOCUMENTS_COLLECTION="documents"
CHUNKS_COLLECTION="chunks"
VECTOR_INDEX_NAME="lawlens_vector_index"

# External Model Credentials
GEMINI_API_KEY="your-gemini-api-key-here"
GROQ_API_KEY="your-groq-api-key-here"
GROQ_MODEL="llama-3.3-70b-versatile"

# Search Defaults
TOP_K=5
MAX_TOP_K=20
SIMILARITY_THRESHOLD=0.65
```

### Backend Startup Command
Install dependencies and launch Uvicorn server:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Health Check Endpoint
Verify backend status via HTTP GET:

```bash
curl http://localhost:8000/api/health
```
Expected response: `{"status": "ok", "project": "LawLens AI - Indian Legal Case Intelligence Platform", "environment": "production"}`

---

## 3. Frontend Deployment Setup

### Environment Variables (`frontend/.env`)
Create `.env` inside `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Production Build
Execute Vite production build:

```bash
cd frontend
npm install
npm run build
```

Output static files are generated in `frontend/dist/` ready to be served by Nginx, Caddy, Vercel, or AWS S3 + CloudFront.

---

## 4. Database & Vector Search Requirements

### MongoDB Atlas Setup
1. Create a MongoDB Atlas cluster (M10+ recommended for production workloads).
2. Create database `lawlens` and collections `documents` and `chunks`.

### Atlas Vector Search Index Definition
Create Vector Search Index named `lawlens_vector_index` on `chunks` collection:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "metadata.document_type"
    },
    {
      "type": "filter",
      "path": "metadata.court"
    },
    {
      "type": "filter",
      "path": "metadata.decision_year"
    },
    {
      "type": "filter",
      "path": "metadata.act_title"
    },
    {
      "type": "filter",
      "path": "metadata.jurisdiction"
    }
  ]
}
```

---

## 5. Security & Secret Safeguards

- **Backend-Only Secrets**: `GEMINI_API_KEY`, `GROQ_API_KEY`, and `MONGODB_URI` must **NEVER** be committed to Git repositories or exposed to frontend client code.
- **CORS Protection**: Ensure `CORS_ORIGINS` strictly specifies authorized frontend domains in production.
- **Untrusted Document Sandboxing**: Retrieved document chunks are strictly sandboxed in prompt templates to prevent prompt-injection exploits.

---

## 6. Operational & Future Roadmap

- **Monitoring & Logging**: Integrate Structured JSON logging (Sentry or Datadog) for FastAPI backend exception tracking.
- **Rate Limiting & Authentication**: Implement API Gateway rate-limiting (e.g. Redis + Slowapi) and JWT OAuth2 authentication for multi-tenant commercial SaaS deployment.
- **Backup & Refresh Strategy**: Automated daily MongoDB Atlas backups and scheduled dataset sync pipelines.
