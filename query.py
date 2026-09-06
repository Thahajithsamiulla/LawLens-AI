from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator

class ResearchQueryCreate(BaseModel):
    question: str = Field(..., min_length=1, description="Legal research question")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Query session metadata")

    @field_validator('question')
    def validate_non_empty_question(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("Research question cannot be empty or whitespace only")
        return value.strip()

class ResearchQueryResponse(BaseModel):
    query_id: str
    question: str
    created_at: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
