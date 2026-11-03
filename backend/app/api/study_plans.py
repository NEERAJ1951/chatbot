from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import datetime
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, StudyPlan
from app.schemas.schemas import StudyPlanGenerateRequest, StudyPlanOut, StudyPlanUpdate
from app.services.ai_service import generate_personalized_study_plan

router = APIRouter(prefix="/study-plans", tags=["Study Plans"])

@router.post("/generate", response_model=StudyPlanOut)
def create_study_plan(
    req: StudyPlanGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generates an AI-tailored study plan based on student diagnostic inputs and saves to database."""
    params = req.model_dump()
    plan_data = generate_personalized_study_plan(params)
    
    target_date = datetime.datetime.utcnow() + datetime.timedelta(days=req.duration_days)

    study_plan = StudyPlan(
        user_id=current_user.id,
        title=plan_data.get("title", f"{req.duration_days}-Day UPSC Preparation Plan"),
        plan_data=plan_data,
        start_date=datetime.datetime.utcnow(),
        target_date=target_date,
        progress_status="In Progress"
    )
    db.add(study_plan)
    db.commit()
    db.refresh(study_plan)
    return study_plan

@router.get("", response_model=List[StudyPlanOut])
def get_user_study_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetches all generated study plans for the logged-in student."""
    return db.query(StudyPlan).filter(
        StudyPlan.user_id == current_user.id
    ).order_by(StudyPlan.created_at.desc()).all()

@router.patch("/{plan_id}", response_model=StudyPlanOut)
def update_study_plan(
    plan_id: str,
    update_data: StudyPlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Updates progress status or details of a study plan."""
    plan = db.query(StudyPlan).filter(
        StudyPlan.id == plan_id,
        StudyPlan.user_id == current_user.id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Study plan not found")

    if update_data.title:
        plan.title = update_data.title
    if update_data.progress_status:
        plan.progress_status = update_data.progress_status
    if update_data.plan_data:
        plan.plan_data = update_data.plan_data

    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/{plan_id}")
def delete_study_plan(
    plan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletes a study plan."""
    plan = db.query(StudyPlan).filter(
        StudyPlan.id == plan_id,
        StudyPlan.user_id == current_user.id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Study plan not found")
    
    db.delete(plan)
    db.commit()
    return {"message": "Study plan deleted successfully"}
