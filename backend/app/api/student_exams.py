# app/api/student_exams.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated, List
import uuid

from app.api import deps
from app.models.user import User
from app.schemas import exam as exam_schema
from app.schemas import submission as submission_schema
from app.services import exam_service, submission_service # Import the new service

router = APIRouter()

# --- New Endpoint ---

@router.post("/exams/{exam_id}/submit", response_model=submission_schema.Submission)
def submit_exam(
    *,
    db: Annotated[Session, Depends(deps.get_db)],
    exam_id: uuid.UUID,
    submission_in: submission_schema.SubmissionCreate,
    current_student: Annotated[User, Depends(deps.get_current_student)],
):
    """
    Submit answers for a specific exam.
    (Student only)
    """
    try:
        submission = submission_service.create_submission(
            db=db,
            student=current_student,
            exam_id=exam_id,
            submission_in=submission_in
        )
        return submission
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )

# --- Existing Endpoint ---

@router.get("/courses/{course_id}/exams", response_model=List[exam_schema.Exam])
def get_published_exams_in_course(
    *,
    db: Annotated[Session, Depends(deps.get_db)],
    course_id: uuid.UUID,
    current_student: Annotated[User, Depends(deps.get_current_student)],
):
    """
    Retrieve all published exams for a specific course the student is enrolled in.
    (Student only)
    """
    exams = exam_service.get_published_exams_for_course(
        db=db, course_id=course_id, student_id=current_student.id
    )
    return exams
