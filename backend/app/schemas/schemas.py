from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field
import datetime

# --- Auth Schemas ---
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    preferred_language: str = "English"
    target_exam_year: int = 2026
    preparation_level: str = "Beginner"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    preferred_language: str
    target_exam_year: int
    preparation_level: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None

# --- Message & Conversation Schemas ---
class Citation(BaseModel):
    document_title: str
    page_number: Optional[int] = None
    snippet: str

class MessageCreate(BaseModel):
    content: str

class MessageOut(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    citations: Optional[List[Dict[str, Any]]] = []
    feedback: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ConversationCreate(BaseModel):
    title: Optional[str] = "New UPSC Conversation"

class ConversationUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)

class ConversationOut(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class ConversationDetailOut(ConversationOut):
    messages: List[MessageOut] = []

class ChatFeedbackRequest(BaseModel):
    feedback: str = Field(..., pattern="^(up|down)$")

# --- AI & Chat Schemas ---
class ChatQueryRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str = Field(..., min_length=1, max_length=10000)
    subject_filter: Optional[str] = None  # e.g. "Polity", "Economy", "History", "Current Affairs", "Admissions"
    language_override: Optional[str] = None # "English", "Hindi", "Hinglish"
    use_rag: bool = True

class MainsEvaluationRequest(BaseModel):
    question: str
    user_answer: str
    marks: int = 15  # 10 or 15 or 20

class MCQGenerateRequest(BaseModel):
    topic: str
    subject: str = "General Studies"
    count: int = 5
    difficulty: str = "Moderate" # "Easy", "Moderate", "UPSC Prelims Standard"

# --- Study Plan Schemas ---
class StudyPlanGenerateRequest(BaseModel):
    preparation_level: str = "Beginner"  # Beginner, Intermediate, Advanced
    target_exam_year: int = 2026
    daily_available_hours: float = 6.0
    optional_subject: str = "Public Administration"
    preferred_language: str = "English"
    strong_subjects: List[str] = ["Polity", "History"]
    weak_subjects: List[str] = ["Economy", "Environment"]
    duration_days: int = 90

class StudyPlanOut(BaseModel):
    id: str
    user_id: str
    title: str
    plan_data: Dict[str, Any]
    start_date: datetime.datetime
    target_date: Optional[datetime.datetime]
    progress_status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class StudyPlanUpdate(BaseModel):
    title: Optional[str] = None
    progress_status: Optional[str] = None
    plan_data: Optional[Dict[str, Any]] = None

# --- Course Schemas ---
class CourseCreate(BaseModel):
    title: str
    description: str
    duration: str
    fee: str
    delivery_mode: str = "Hybrid"
    batch_schedule: str
    faculty: Optional[str] = "Eminent Faculty & Retired Civil Servants"
    active_status: bool = True

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[str] = None
    fee: Optional[str] = None
    delivery_mode: Optional[str] = None
    batch_schedule: Optional[str] = None
    faculty: Optional[str] = None
    active_status: Optional[bool] = None

class CourseOut(BaseModel):
    id: str
    title: str
    description: str
    duration: str
    fee: str
    delivery_mode: str
    batch_schedule: str
    faculty: str
    active_status: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Admission Enquiry Schemas ---
class AdmissionEnquiryCreate(BaseModel):
    student_name: str
    email: EmailStr
    phone: str
    course_id: Optional[str] = None
    message: Optional[str] = None
    consent_given: bool = True

class AdmissionEnquiryUpdate(BaseModel):
    status: str # "NEW", "CONTACTED", "COUNSELED", "ENROLLED"

class AdmissionEnquiryOut(BaseModel):
    id: str
    student_name: str
    email: EmailStr
    phone: str
    course_id: Optional[str]
    message: Optional[str]
    consent_given: bool
    status: str
    created_at: datetime.datetime
    course: Optional[CourseOut] = None

    class Config:
        from_attributes = True

# --- RAG & Admin Documents Schemas ---
class KnowledgeDocumentOut(BaseModel):
    id: str
    title: str
    document_type: str
    processing_status: str
    chunk_count: int
    uploaded_at: datetime.datetime

    class Config:
        from_attributes = True

class AdminAnalyticsOut(BaseModel):
    total_users: int
    total_conversations: int
    total_messages: int
    total_enquiries: int
    total_documents: int
    active_courses: int
    avg_latency_ms: float
    error_count: int
