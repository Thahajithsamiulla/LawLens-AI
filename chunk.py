from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, field_validator

class ChunkCreate(BaseModel):
    text: str = Field(..., min_length=1, description="Legal text excerpt content")
    section: Optional[str] = Field(default=None, description="Section heading or designation")
    article: Optional[str] = Field(default=None, description="Article heading or designation")
    page: Optional[int] = Field(default=None, ge=1, description="Page number in original document")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Custom chunk metadata")

    @field_validator('text')
    def validate_non_empty_text(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("Chunk text cannot be empty or whitespace only")
        return value.strip()

class ChunkResponse(BaseModel):
    chunk_id: str
    document_id: str
    text: str
    section: Optional[str] = None
    article: Optional[str] = None
    page: Optional[int] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    embedding: Optional[List[float]] = None  # Nullable for Step 2
    created_at: str
