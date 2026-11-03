import datetime
import uuid
from sqlalchemy import Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="student", nullable=False)  # "student" or "admin"
    preferred_language = Column(String(50), default="English")   # English, Hindi, Hinglish
    target_exam_year = Column(Integer, default=2026)
    preparation_level = Column(String(50), default="Beginner")   # Beginner, Intermediate, Advanced
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    study_plans = relationship("StudyPlan", back_populates="user", cascade="all, delete-orphan")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), default="New UPSC Conversation")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")

class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # "user", "assistant", "system"
    content = Column(Text, nullable=False)
    citations = Column(JSON, default=list)      # [{ "document_title": ..., "page_number": ..., "snippet": ... }]
    feedback = Column(String(10), nullable=True) # "up", "down", or null
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")

class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), default="Customized UPSC Study Plan")
    plan_data = Column(JSON, nullable=False)    # Detailed daily & weekly schedule, subjects, targets
    start_date = Column(DateTime, default=datetime.datetime.utcnow)
    target_date = Column(DateTime, nullable=True)
    progress_status = Column(String(50), default="In Progress")  # "Not Started", "In Progress", "Completed"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="study_plans")

class Course(Base):
    __tablename__ = "courses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    duration = Column(String(100), nullable=False)       # e.g., "12 Months", "6 Months"
    fee = Column(String(50), nullable=False)            # e.g., "₹ 85,000"
    delivery_mode = Column(String(50), default="Hybrid") # "Online", "Offline", "Hybrid"
    batch_schedule = Column(String(150), nullable=False) # e.g., "Morning: 8:00 AM - 11:30 AM"
    faculty = Column(String(200), default="Eminent Civil Servants & Senior Faculty")
    active_status = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    enquiries = relationship("AdmissionEnquiry", back_populates="course")

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    document_type = Column(String(20), default="PDF")   # "PDF", "DOCX", "TXT"
    storage_path = Column(String(500), nullable=False)
    processing_status = Column(String(30), default="PENDING")  # "PENDING", "PROCESSING", "COMPLETED", "FAILED"
    chunk_count = Column(Integer, default=0)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("knowledge_documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(JSON, nullable=True)     # Store vector embeddings list for cosine search
    page_number = Column(Integer, nullable=True)
    chunk_metadata = Column(JSON, default=dict)

    # Relationships
    document = relationship("KnowledgeDocument", back_populates="chunks")

class AdmissionEnquiry(Base):
    __tablename__ = "admission_enquiries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_name = Column(String(120), nullable=False)
    email = Column(String(150), nullable=False)
    phone = Column(String(30), nullable=False)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    message = Column(Text, nullable=True)
    consent_given = Column(Boolean, default=False, nullable=False)
    status = Column(String(30), default="NEW")  # "NEW", "CONTACTED", "COUNSELED", "ENROLLED"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    course = relationship("Course", back_populates="enquiries")

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_type = Column(String(50), nullable=False) # "chat_query", "rag_retrieval", "study_plan_gen"
    latency_ms = Column(Float, default=0.0)
    status_code = Column(Integer, default=200)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
