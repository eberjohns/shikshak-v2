# app/api/student_courses.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Annotated
import uuid

from app.api import deps
from app.models.user import User
from app.schemas import course as course_schema
from app.services import course_service

router = APIRouter()

@router.get("/courses", response_model=List[course_schema.CoursePublic])
def browse_all_courses(
    *,
    db: Annotated[Session, Depends(deps.get_db)],
    current_user: Annotated[User, Depends(deps.get_current_user)],
):
    """
    Retrieve all available courses for browsing. (Any authenticated user)
    """
    return course_service.get_all_courses(db=db)

@router.post("/courses/{course_id}/enroll", response_model=course_schema.Course)
def enroll_in_course(
    *,
    db: Annotated[Session, Depends(deps.get_db)],
    course_id: uuid.UUID,
    current_student: Annotated[User, Depends(deps.get_current_student)],
):
    """
    Enroll the current student in a course. (Student only)
    """
    course = course_service.get_course_by_id(db=db, course_id=course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if student is already enrolled
    if current_student in course.students_enrolled:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")

    return course_service.enroll_student_in_course(db=db, student=current_student, course=course)
    
@router.get("/my-courses", response_model=List[course_schema.Course])
def get_my_enrolled_courses(
    *,
    db: Annotated[Session, Depends(deps.get_db)],
    current_student: Annotated[User, Depends(deps.get_current_student)],
):
    """
    Retrieve all courses the current student is enrolled in. (Student only)
    """
    return course_service.get_courses_by_student(db=db, student_id=current_student.id)
