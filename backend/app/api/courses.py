from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Course
from app.schemas.schemas import CourseOut

router = APIRouter(prefix="/courses", tags=["Coaching Courses"])

@router.get("", response_model=List[CourseOut])
def get_all_active_courses(db: Session = Depends(get_db)):
    """Retrieves all active courses offered by AntiGravity IAS Academy."""
    return db.query(Course).filter(Course.active_status == True).all()

@router.get("/{course_id}", response_model=CourseOut)
def get_course_detail(course_id: str, db: Session = Depends(get_db)):
    """Retrieves comprehensive details of a specific UPSC course."""
    course = db.query(Course).filter(Course.id == course_id, Course.active_status == True).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course
