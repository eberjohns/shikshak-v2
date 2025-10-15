from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated
import uuid

from app.api import deps
from app.models.user import User
from app.schemas import analytics as analytics_schema
from app.services import analytics_service

router = APIRouter()

@router.get("/courses/{course_id}/analytics", response_model=analytics_schema.CourseAnalytics)
def get_course_analytics_data(
    *,
    db: Annotated[Session, Depends(deps.get_db)],
    course_id: uuid.UUID,
    current_teacher: Annotated[User, Depends(deps.get_current_user)],
):
    """
    Retrieve comprehensive analytics for a specific course.
    (Teacher only)
    """
    analytics = analytics_service.get_course_analytics(
        db=db, course_id=course_id, teacher_id=current_teacher.id
    )
    if not analytics:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found or you do not have permission to access it.")
    
    return analytics
