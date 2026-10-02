from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class UserProfile(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    state: Optional[str] = "Tamil Nadu"
    district: Optional[str] = None
    occupation: Optional[str] = None
    income: Optional[float] = None
    caste: Optional[str] = None
    community: Optional[str] = None
    disability: Optional[bool] = None
    bpl: Optional[bool] = None
    student: Optional[bool] = None
    farmer: Optional[bool] = None

class SchemeModel(BaseModel):
    id: Optional[int] = None
    scheme_id: str
    slug: str
    name: str
    name_tamil: Optional[str] = None
    description: str
    description_tamil: Optional[str] = None
    ministry: Optional[str] = None
    department: Optional[str] = None
    state: str = "Tamil Nadu"
    category: str
    beneficiary_type: Optional[str] = None
    benefits: Optional[str] = None
    eligibility_text: str
    eligibility_text_tamil: Optional[str] = None
    application_process: Optional[str] = None
    application_process_tamil: Optional[str] = None
    documents_required: Optional[str] = None
    documents_required_tamil: Optional[str] = None
    apply_url: Optional[str] = None
    official_url: Optional[str] = None
    eligibility_age_min: Optional[int] = None
    eligibility_age_max: Optional[int] = None
    eligibility_gender: Optional[str] = "all"
    eligibility_caste: Optional[str] = "all"
    eligibility_income_max: Optional[float] = None
    eligibility_residence: Optional[str] = "Tamil Nadu"
    eligibility_state: Optional[str] = "Tamil Nadu"
    eligibility_disability: Optional[bool] = False
    eligibility_bpl: Optional[bool] = False
    application_mode: Optional[str] = "offline"
    url_status: Optional[str] = "active"
    scraped_at: Optional[str] = None

class SchemeListResponse(BaseModel):
    items: List[SchemeModel]
    total: int
    page: int
    limit: int
    total_pages: int

class RecommendationRequest(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    state: Optional[str] = "Tamil Nadu"
    district: Optional[str] = None
    occupation: Optional[str] = None
    income: Optional[float] = None
    caste: Optional[str] = None
    community: Optional[str] = None
    disability: Optional[bool] = None
    bpl: Optional[bool] = None
    student: Optional[bool] = None
    farmer: Optional[bool] = None
    query: Optional[str] = None

class RecommendationItem(BaseModel):
    scheme_id: str
    name: str
    name_tamil: Optional[str] = None
    category: str
    beneficiary_type: Optional[str] = None
    reasons: List[str]
    missing_information: List[str]
    eligibility_status: str # "ELIGIBLE", "POTENTIAL_MATCH", "INELIGIBLE"
    benefits: str
    documents_required: str
    apply_url: Optional[str] = None
    official_url: Optional[str] = None
    application_mode: str
    is_online_application: bool
    relevance_score: Optional[float] = None

class RecommendationResponse(BaseModel):
    recommendations: List[RecommendationItem]
    total: int
    profile_summary: Optional[Dict[str, Any]] = None

class DocumentCheckRequest(BaseModel):
    scheme_id: str
    available_documents: List[str]

class DocumentCheckResponse(BaseModel):
    scheme_id: str
    scheme_name: str
    scheme_name_tamil: Optional[str] = None
    required_documents: List[str]
    available: List[str]
    missing: List[str]
    readiness_status: str # "READY", "PARTIALLY_READY", "MISSING_DOCUMENTS"
    total_required: int
    available_count: int
    missing_count: int
    application_mode: str
    is_online_application: bool
    application_process: str
    guidance: str

class FormField(BaseModel):
    id: str
    label: str
    value: str = ""
    explanation: str
    explanation_tamil: str
    required: bool = False
    expected_format: str = ""
    source: str = "form"
    confidence: float = 0.0
    status: str = "empty" # "empty", "complete", "needs_review"

class FormAnalysisResponse(BaseModel):
    filename: str
    source_type: str
    ocr_used: bool
    extracted_text: str
    fields: List[FormField]
    official_form_url: Optional[str] = None
    scheme_id: Optional[str] = None
    scheme_name: Optional[str] = None
    required_documents: List[str] = []

class FormFieldUpdate(BaseModel):
    field_id: str
    value: str
    language: Optional[str] = "en"

class DocumentMappingResponse(BaseModel):
    filename: str
    extracted_text: str
    matches: List[Dict[str, Any]]

class ComparisonRequest(BaseModel):
    scheme_ids: List[str]

class ComparisonResponse(BaseModel):
    schemes: List[Dict[str, Any]]
    comparisons: Dict[str, Dict[str, Any]]

class ProfileExtractRequest(BaseModel):
    text: str

class ProfileExtractResponse(BaseModel):
    extracted: UserProfile
    detected_entities: Dict[str, Any]

class ChatContext(BaseModel):
    page: Optional[str] = "home" # "home", "scheme_list", "scheme_detail", "document_checker", "comparison"
    scheme_id: Optional[str] = None
    selected_schemes: Optional[List[str]] = []
    user_profile: Optional[Dict[str, Any]] = None
    documents_state: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "en" # "en", "ta", "tanglish"
    context: Optional[ChatContext] = None
    profile: Optional[UserProfile] = None

class ChatResponse(BaseModel):
    reply: str
    language: str
    detected_intent: str
    context_used: Dict[str, Any]
    relevant_schemes: Optional[List[Dict[str, Any]]] = []
    suggestions: Optional[List[str]] = []
