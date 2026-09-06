# MongoDB Atlas Vector Search Setup Guide

This document outlines the setup, configuration, and index definition required to enable **MongoDB Atlas Vector Search** for **LawLens AI**.

---

## 📋 1. Requirements Overview

- **Database Host**: MongoDB Atlas (Cluster tier M10+ or Atlas Serverless with Vector Search enabled)
- **Database Name**: `lawlens`
- **Target Collection**: `chunks`
- **Vector Path**: `embedding`
- **Vector Dimension**: `1536`
- **Similarity Metric**: `cosine`
- **Index Name**: `lawlens_vector_index` (configured via `MONGODB_VECTOR_INDEX`)

---

## 🛠️ 2. Atlas Vector Search Index Definition

Create an Atlas Vector Search Index on the `chunks` collection using the following JSON definition:

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
      "path": "metadata.year"
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

## 🖱️ 3. How to Create the Index in Atlas UI

1. Log into **MongoDB Atlas Console** and navigate to your project.
2. Select your cluster and click **Database** $\rightarrow$ **Browse Collections**.
3. Select the `lawlens` database and click the `chunks` collection.
4. Click the **Atlas Search** tab (or **Search Indexes** tab) at the top.
5. Click **Create Search Index** and choose **Atlas Vector Search** $\rightarrow$ **JSON Editor**.
6. Select `lawlens.chunks` as the target collection.
7. Set **Index Name** to: `lawlens_vector_index`.
8. Paste the JSON index definition above into the editor.
9. Click **Next** $\rightarrow$ **Create Vector Search Index**.

---

## 🔍 4. How to Verify the Index

Wait 1–3 minutes for Atlas to complete initial index building. The status will transition from `Building` to `Active`.

To test the index using Python:

```bash
python -m backend.scripts.test_retrieval
```

---

## ⚙️ 5. Required Environment Variables

Set the following variables in `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=lawlens

MONGODB_VECTOR_INDEX=lawlens_vector_index
VECTOR_NUM_CANDIDATES=100
TOP_K=5
MAX_TOP_K=20
```

---

## 🌐 6. Example Retrieval API Request

### Request (`POST /api/retrieval/search`)

```json
{
  "query": "What are the requirements for anticipatory bail under Section 438?",
  "top_k": 5,
  "filters": {
    "document_type": "JUDGMENT"
  }
}
```

### Response (`200 OK`)

```json
{
  "query": "What are the requirements for anticipatory bail under Section 438?",
  "count": 1,
  "results": [
    {
      "chunk_id": "chunk-13f629c40dc16077",
      "document_id": "doc-jgm-4fd26ed2c125e345",
      "text": "Case title: MD. JAMILUDIN NASIR versus STATE OF WEST BENGAL...",
      "score": 0.8654,
      "metadata": {
        "document_type": "JUDGMENT",
        "court": "Supreme Court of India",
        "decision_date": "2015-04-10",
        "chunk_index": 0
      }
    }
  ]
}
```
