from pydantic import BaseModel
from typing import List, Optional

class ResearchQueryRequest(BaseModel):
    query: str
    conversation_id: Optional[str] = None

class EvidenceSource(BaseModel):
    id: str
    title: str
    document_type: str  # Statutory Act, Supreme Court Judgment, Law Review, etc.
    section_article: str
    citation: str
    snippet: str
    verification_status: str  # Verified, High Confidence, Pending Review

class ResearchQueryResponse(BaseModel):
    id: str
    query: str
    answer: str
    timestamp: str
    evidence: List[EvidenceSource]
