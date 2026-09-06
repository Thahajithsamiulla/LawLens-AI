from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
import datetime

class DocumentType(str, Enum):
    LAW = "LAW"
    JUDGMENT = "JUDGMENT"
    CONTRACT = "CONTRACT"
    REGULATION = "REGULATION"

class DocumentCreate(BaseModel):
    title: str = Field(..., min_length=1, description="Document title")
    document_type: DocumentType = Field(..., description="Document category (LAW, JUDGMENT, CONTRACT, REGULATION)")
    jurisdiction: str = Field(..., min_length=1, description="Legal jurisdiction (e.g. India, Federal, Delaware)")
    source: str = Field(..., min_length=1, description="Source organization or publishing authority")
    source_url: Optional[str] = Field(default=None, description="Optional URL reference")
    description: Optional[str] = Field(default=None, description="Optional document summary")
    publication_date: Optional[str] = Field(default=None, description="Publication date string (YYYY-MM-DD)")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Custom metadata key-value pairs")

    @field_validator('title', 'jurisdiction', 'source')

    def validate_non_empty(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("Field cannot be empty or whitespace only")
        return value.strip()

class DocumentResponse(BaseModel):
    document_id: str
    title: str
    document_type: DocumentType
    jurisdiction: str
    source: str
    source_url: Optional[str] = None
    description: Optional[str] = None
    publication_date: Optional[str] = None
    created_at: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
