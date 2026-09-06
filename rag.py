from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator
from app.core.config import settings
from app.schemas.retrieval import RetrievalFilter

class RAGRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000, description="User legal research question")
    session_id: Optional[str] = Field(default=None, description="Optional persistent research session ID")
    top_k: int = Field(default=settings.TOP_K, ge=1, le=settings.MAX_TOP_K, description="Number of top relevant chunks to retrieve")
    filters: Optional[RetrievalFilter] = Field(default=None, description="Optional metadata filters (document_type, court, decision_year, act_title, jurisdiction)")
    verify: bool = Field(default=True, description="Whether to execute Groq secondary verification")

    @field_validator('query')
    def validate_non_empty_query(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("Query string cannot be empty or whitespace only")
        return value.strip()

class RAGEvidenceItem(BaseModel):
    chunk_id: str = Field(..., description="Unique chunk identifier")
    document_id: str = Field(..., description="Unique parent document identifier")
    document_type: str = Field(..., description="Document type: LAW or JUDGMENT")
    title: Optional[str] = Field(default=None, description="Act title or Case title")
    court: Optional[str] = Field(default=None, description="Court name for judgments")
    year: Optional[int] = Field(default=None, description="Year of decision or statute enactment")
    section_number: Optional[str] = Field(default=None, description="Section number for bare acts")
    score: Optional[float] = Field(default=None, description="Relevance score from vector search")

class LegalClaim(BaseModel):
    claim_id: str = Field(..., description="Unique claim identifier, e.g. claim-001")
    claim_text: str = Field(..., description="Atomic legal statement or claim text")
    claim_type: str = Field(
        default="OTHER",
        description="Type of claim: STATUTORY_RULE, CASE_PRINCIPLE, CASE_HOLDING, PROCEDURAL_RULE, FACTUAL_STATEMENT, SYNTHESIS, OTHER"
    )
    evidence_ids: List[str] = Field(default_factory=list, description="Backend-validated chunk IDs supporting this claim")
    support_status: str = Field(
        default="UNSUPPORTED",
        description="Evidence support status: SUPPORTED, PARTIALLY_SUPPORTED, UNSUPPORTED"
    )

class CitationReference(BaseModel):
    citation_id: str = Field(..., description="Unique citation identifier, e.g. citation-001")
    citation_text: str = Field(..., description="Text of legal citation or reference as stated in answer")
    citation_type: str = Field(
        default="OTHER",
        description="Citation type: CASE, STATUTE, SECTION, REGULATION, OTHER"
    )
    claim_id: Optional[str] = Field(default=None, description="Associated claim ID if applicable")
    evidence_ids: List[str] = Field(default_factory=list, description="Backend-validated chunk IDs containing or supporting this citation")

class ClaimVerification(BaseModel):
    claim_id: str = Field(..., description="Unique claim identifier")
    status: str = Field(..., description="Verification status: SUPPORTED, PARTIALLY_SUPPORTED, NOT_SUPPORTED, UNVERIFIABLE")
    reason: str = Field(..., description="Detailed verification reasoning from Groq model")
    evidence_ids: List[str] = Field(default_factory=list, description="Backend-validated chunk IDs supporting verification")

class CitationVerification(BaseModel):
    citation_id: str = Field(..., description="Unique citation identifier")
    status: str = Field(..., description="Verification status: SUPPORTED, PARTIALLY_SUPPORTED, NOT_SUPPORTED, UNVERIFIABLE")
    reason: str = Field(..., description="Detailed verification reasoning from Groq model")
    evidence_ids: List[str] = Field(default_factory=list, description="Backend-validated chunk IDs supporting verification")

class VerificationResponse(BaseModel):
    overall_status: str = Field(..., description="Overall verification result: VERIFIED, PARTIALLY_VERIFIED, NOT_VERIFIED, UNVERIFIABLE")
    summary: str = Field(..., description="Executive summary of verification findings")
    claim_verifications: List[ClaimVerification] = Field(default_factory=list, description="Claim-level verification evaluations")
    citation_verifications: List[CitationVerification] = Field(default_factory=list, description="Citation-level verification evaluations")
    warnings: List[str] = Field(default_factory=list, description="Specific verification warnings or evidence gaps")

class RAGResponse(BaseModel):
    session_id: Optional[str] = Field(default=None, description="Persistent research session ID")
    query: str = Field(..., description="Cleaned user research query")
    answer: str = Field(..., description="Grounded legal research answer synthesized from evidence")
    key_points: List[str] = Field(default_factory=list, description="Key takeaway points derived from retrieved evidence")
    evidence: List[RAGEvidenceItem] = Field(default_factory=list, description="List of retrieved legal evidence metadata items")
    claims: List[LegalClaim] = Field(default_factory=list, description="List of atomic legal claims extracted from generated answer")
    citations: List[CitationReference] = Field(default_factory=list, description="List of legal citations/references extracted from generated answer")
    verification: Optional[VerificationResponse] = Field(default=None, description="Independent Groq verification evaluation results")
    status: str = Field(..., description="RAG status: 'grounded' or 'insufficient_evidence'")
    limitations: List[str] = Field(default_factory=list, description="List of research limitations or evidence gaps")
    disclaimer: str = Field(
        default="This output is for legal research assistance and is not a substitute for advice from a qualified legal professional.",
        description="Legal disclaimer"
    )

class ResearchSessionCreate(BaseModel):
    title: Optional[str] = Field(default="New Research", description="Session title")
    initial_query: Optional[str] = Field(default="", description="Initial user question")

class ResearchSessionSummary(BaseModel):
    session_id: str
    title: str
    initial_query: Optional[str] = ""
    created_at: str
    updated_at: str
    verification_status: Optional[str] = "PENDING"
    message_count: int = 0

class ResearchSessionDetail(BaseModel):
    session_id: str
    title: str
    initial_query: Optional[str] = ""
    created_at: str
    updated_at: str
    messages: List[Dict[str, Any]] = Field(default_factory=list)
    evidence: List[Dict[str, Any]] = Field(default_factory=list)
    verification_status: Optional[str] = "PENDING"

