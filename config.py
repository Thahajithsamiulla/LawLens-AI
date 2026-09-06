import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "LawLens AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database configuration
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "lawlens")
    
    # Environment keys (placeholders)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

    # Embedding configuration
    GEMINI_EMBEDDING_MODEL: str = os.getenv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001")
    EMBEDDING_DIMENSION: int = int(os.getenv("EMBEDDING_DIMENSION", "1536"))
    EMBEDDING_BATCH_SIZE: int = int(os.getenv("EMBEDDING_BATCH_SIZE", "50"))
    EMBEDDING_VERSION: str = os.getenv("EMBEDDING_VERSION", "v1")

    # Vector Search configuration
    MONGODB_VECTOR_INDEX: str = os.getenv("MONGODB_VECTOR_INDEX", "lawlens_vector_index")
    VECTOR_NUM_CANDIDATES: int = int(os.getenv("VECTOR_NUM_CANDIDATES", "100"))
    TOP_K: int = int(os.getenv("TOP_K", "5"))
    MAX_TOP_K: int = int(os.getenv("MAX_TOP_K", "20"))
    
    # RAG Reasoning configuration
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL") or os.getenv("GEMINI_REASONING_MODEL") or "gemini-3.6-flash"
    GEMINI_REASONING_MODEL: str = os.getenv("GEMINI_MODEL") or os.getenv("GEMINI_REASONING_MODEL") or "gemini-3.6-flash"
    RAG_MAX_CONTEXT_CHUNKS: int = int(os.getenv("RAG_MAX_CONTEXT_CHUNKS", "5"))
    
    # Groq Verification configuration
    GROQ_VERIFICATION_MODEL: str = os.getenv("GROQ_VERIFICATION_MODEL", "llama-3.3-70b-versatile")
    GROQ_API_URL: str = os.getenv("GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions")
    
    # CORS
    CORS_ORIGINS: list[str] = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    ).split(",")

settings = Settings()
