# app/api/courses.py

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.api import deps
from app.models.user import User
from app.schemas import course as course_schema
from app.services import ai_service, course_service

router = APIRouter()

@router.get("/", response_model=List[course_schema.Course])
def get_my_courses(
    *,
    db: Session = Depends(deps.get_db),
    current_teacher: User = Depends(deps.get_current_teacher),
):
    """
    Retrieve all courses created by the current teacher. (Teacher only)
    """
    courses = course_service.get_courses_by_teacher(db=db, teacher_id=current_teacher.id)
    return courses

@router.post("/", response_model=course_schema.Course)
async def create_course(
    *,
    db: Session = Depends(deps.get_db),
    current_teacher: User = Depends(deps.get_current_teacher),
    course_name: str = Form(...),
    syllabus_file: UploadFile = File(...)
):
    """
    Create a new course. (Teacher only)

    This endpoint accepts a syllabus PDF, generates a schedule using an AI model,
    and creates the course in the database.
    """
    if not syllabus_file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    schedule_data = await ai_service.generate_schedule_from_syllabus(syllabus_file)

    course_in = course_schema.CourseCreate(course_name=course_name)
    course = course_service.create_course_with_schedule(
        db=db, course_in=course_in, teacher=current_teacher, schedule_data=schedule_data
    )
    return course

@router.get("/{course_id}", response_model=course_schema.Course)
def get_course_details(
    *,
    db: Session = Depends(deps.get_db),
    course_id: uuid.UUID,
    current_teacher: User = Depends(deps.get_current_teacher),
):
    """
    Retrieve details for a specific course created by the current teacher.
    (Teacher only)
    """
    course = course_service.get_course_by_id_and_teacher(
        db=db, course_id=course_id, teacher_id=current_teacher.id
    )
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or you do not have permission to access it.")
    return course
