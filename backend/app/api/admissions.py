from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import AdmissionEnquiry, Course
from app.schemas.schemas import AdmissionEnquiryCreate, AdmissionEnquiryOut

router = APIRouter(prefix="/admissions", tags=["Admissions & Counsellor"])

@router.post("/enquiries", response_model=AdmissionEnquiryOut)
def submit_admission_enquiry(
    enquiry_in: AdmissionEnquiryCreate,
    db: Session = Depends(get_db)
):
    """
    Submits a student admission enquiry for human academic counsellor handoff.
    Requires student consent before processing contact information.
    """
    if not enquiry_in.consent_given:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student consent is required to connect with an academic counsellor."
        )

    # Validate course_id if provided
    if enquiry_in.course_id:
        course = db.query(Course).filter(Course.id == enquiry_in.course_id).first()
        if not course:
            raise HTTPException(status_code=400, detail="Specified course does not exist.")

    enquiry = AdmissionEnquiry(
        student_name=enquiry_in.student_name,
        email=enquiry_in.email,
        phone=enquiry_in.phone,
        course_id=enquiry_in.course_id,
        message=enquiry_in.message,
        consent_given=enquiry_in.consent_given,
        status="NEW"
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)
    return enquiry
