import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_active_admin
from app.models.models import (
    User, Conversation, Message, Course, KnowledgeDocument, 
    DocumentChunk, AdmissionEnquiry, AnalyticsEvent
)
from app.schemas.schemas import (
    AdminAnalyticsOut, KnowledgeDocumentOut, CourseCreate, CourseUpdate, 
    CourseOut, AdmissionEnquiryOut, AdmissionEnquiryUpdate
)
from app.services.rag_service import process_and_chunk_document

router = APIRouter(prefix="/admin", tags=["Admin Portal & Knowledge Management"])

# --- Analytics Dashboard ---
@router.get("/analytics", response_model=AdminAnalyticsOut)
def get_admin_analytics(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Provides high-level system analytics, conversation count, latency, and error metrics."""
    total_users = db.query(User).count()
    total_conversations = db.query(Conversation).count()
    total_messages = db.query(Message).count()
    total_enquiries = db.query(AdmissionEnquiry).count()
    total_documents = db.query(KnowledgeDocument).count()
    active_courses = db.query(Course).filter(Course.active_status == True).count()

    avg_latency = db.query(func.avg(AnalyticsEvent.latency_ms)).scalar() or 0.0
    error_count = db.query(AnalyticsEvent).filter(AnalyticsEvent.status_code >= 400).count()

    return {
        "total_users": total_users,
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "total_enquiries": total_enquiries,
        "total_documents": total_documents,
        "active_courses": active_courses,
        "avg_latency_ms": round(float(avg_latency), 2),
        "error_count": error_count
    }

# --- Document Ingestion & RAG Management ---
@router.get("/documents", response_model=List[KnowledgeDocumentOut])
def get_knowledge_documents(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Lists all ingested documents in the institute's RAG knowledge base."""
    return db.query(KnowledgeDocument).order_by(KnowledgeDocument.uploaded_at.desc()).all()

@router.post("/documents", response_model=KnowledgeDocumentOut)
async def upload_knowledge_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """
    Uploads PDF, DOCX, or TXT documents into the RAG pipeline.
    Extracts text per page, chunks with overlap, computes vector embeddings, and stores for retrieval.
    """
    filename = file.filename or "uploaded_document"
    ext = filename.split(".")[-1].upper()
    if ext not in ("PDF", "DOCX", "TXT", "MD"):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format: .{ext}. Allowed formats: PDF, DOCX, TXT."
        )

    # Save file to disk
    doc_title = title or filename
    saved_filename = f"{int(func.unix_timestamp() if hasattr(func, 'unix_timestamp') else 0)}_{filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, saved_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Create document record
    doc_record = KnowledgeDocument(
        title=doc_title,
        document_type=ext,
        storage_path=file_path,
        processing_status="PROCESSING"
    )
    db.add(doc_record)
    db.commit()
    db.refresh(doc_record)

    try:
        # Process and chunk
        chunks = process_and_chunk_document(file_path, ext)
        for c in chunks:
            chunk_row = DocumentChunk(
                document_id=doc_record.id,
                chunk_text=c["chunk_text"],
                embedding=c["embedding"],
                page_number=c["page_number"],
                chunk_metadata=c.get("metadata", {})
            )
            db.add(chunk_row)

        doc_record.processing_status = "COMPLETED"
        doc_record.chunk_count = len(chunks)
        db.commit()
        db.refresh(doc_record)

    except Exception as e:
        doc_record.processing_status = "FAILED"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to process document: {e}")

    return doc_record

@router.delete("/documents/{document_id}")
def delete_knowledge_document(
    document_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Deletes a document and all its associated vector chunks from the RAG store."""
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Try deleting physical file if exists
    if os.path.exists(doc.storage_path):
        try:
            os.remove(doc.storage_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return {"message": "Document and all embedded chunks successfully removed"}

# --- Admission Enquiries Management ---
@router.get("/enquiries", response_model=List[AdmissionEnquiryOut])
def list_admission_enquiries(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Lists student counselling enquiries for administrative follow-up."""
    q = db.query(AdmissionEnquiry)
    if status_filter:
        q = q.filter(AdmissionEnquiry.status == status_filter)
    return q.order_by(AdmissionEnquiry.created_at.desc()).all()

@router.patch("/enquiries/{enquiry_id}", response_model=AdmissionEnquiryOut)
def update_enquiry_status(
    enquiry_id: str,
    status_data: AdmissionEnquiryUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Updates status of a student enquiry (e.g. NEW -> CONTACTED -> COUNSELED)."""
    enquiry = db.query(AdmissionEnquiry).filter(AdmissionEnquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    enquiry.status = status_data.status
    db.commit()
    db.refresh(enquiry)
    return enquiry

# --- Course Management (CRUD) ---
@router.post("/courses", response_model=CourseOut)
def create_course(
    course_in: CourseCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Creates a new institute course."""
    course = Course(**course_in.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

@router.patch("/courses/{course_id}", response_model=CourseOut)
def update_course(
    course_id: str,
    course_in: CourseUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Updates details, fees, or batch schedules of an existing course."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    for k, v in course_in.model_dump(exclude_unset=True).items():
        setattr(course, k, v)

    db.commit()
    db.refresh(course)
    return course

@router.delete("/courses/{course_id}")
def delete_course(
    course_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Deactivates/deletes a course."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course.active_status = False
    db.commit()
    return {"message": "Course marked inactive successfully"}
