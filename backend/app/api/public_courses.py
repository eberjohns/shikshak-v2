# app/api/public_courses.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated
import uuid

from app.api import deps
from app.models.user import User
from app.schemas import course as course_schema
from app.services import course_service

router = APIRouter()

@router.get("/{course_id}", response_model=course_schema.Course)
def get_public_course_details(
    *,
    db: Annotated[Session, Depends(deps.get_db)],
    course_id: uuid.UUID,
    # This just ensures the user is logged in, but doesn't check their role
    current_user: Annotated[User, Depends(deps.get_current_user)],
):
    """
    Retrieve details for a single public course. (Any authenticated user)
    """
    course = course_service.get_public_course_by_id(db=db, course_id=course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")
    return course
