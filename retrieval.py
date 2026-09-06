from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, field_validator
from app.core.config import settings

class RetrievalFilter(BaseModel):
    document_type: Optional[Union[str, List[str]]] = Field(default=None, description="LAW, JUDGMENT, or list of document types")
    court: Optional[str] = Field(default=None, description="Court name filter")
    decision_year: Optional[int] = Field(default=None, description="Decision or publication year filter")
    act_title: Optional[str] = Field(default=None, description="Bare Act title filter")
    jurisdiction: Optional[str] = Field(default=None, description="Jurisdiction filter")

class RetrievalRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000, description="User legal research question or query string")
    top_k: int = Field(default=settings.TOP_K, ge=1, le=settings.MAX_TOP_K, description="Number of top relevant chunks to retrieve")
    filters: Optional[RetrievalFilter] = Field(default=None, description="Optional metadata filters")

    @field_validator('query')
    def validate_non_empty_query(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("Query string cannot be empty or whitespace only")
        return value.strip()

class SearchResultItem(BaseModel):
    chunk_id: str
    document_id: str
    text: str
    score: float = Field(..., description="Vector similarity search score (e.g. 0.87)")
    metadata: Dict[str, Any] = Field(default_factory=dict)

class RetrievalResponse(BaseModel):
    query: str
    results: List[SearchResultItem]
    count: int
