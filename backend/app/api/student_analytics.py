from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Annotated, List

from app.api import deps
from app.models.user import User
from app.schemas import analytics as analytics_schema
from app.services import analytics_service

router = APIRouter()

@router.get("/analytics/upcoming-topics", response_model=List[analytics_schema.UpcomingTopic])
def get_upcoming_topics(
    *,
    db: Annotated[Session, Depends(deps.get_db)],
    current_student: Annotated[User, Depends(deps.get_current_student)],
):
    """
    Retrieve upcoming topics for the current student.
    """
    topics = analytics_service.get_student_upcoming_topics(db=db, student_id=current_student.id)
    return topics

@router.get("/analytics/performance-summary", response_model=analytics_schema.StudentPerformanceSummary)
def get_performance_summary(
    *,
    db: Annotated[Session, Depends(deps.get_db)],
    current_student: Annotated[User, Depends(deps.get_current_student)],
):
    """
    Retrieve a performance summary for the current student, highlighting areas for improvement.
    """
    summary = analytics_service.get_student_performance_summary(db=db, student_id=current_student.id)
    return summary
