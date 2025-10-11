# app/api/student_exams.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated, List
import uuid

from app.api import deps
from app.models.user import User
from app.schemas import exam as exam_schema
from app.schemas import submission as submission_schema
from app.services import exam_service, submission_service

router = APIRouter()

# --- New Endpoint to List All Submissions ---

@router.get("/my-submissions", response_model=List[submission_schema.SubmissionSummary])
def get_my_submissions(
    *,
    db: Annotated[Session, Depends(deps.get_db)],
    current_student: Annotated[User, Depends(deps.get_current_student)],
):
    """
    Retrieve a list of all submissions for the current student.
    (Student only)
    """
    submissions = submission_service.get_submissions_by_student(
        db=db, student_id=current_student.id
    )
    return submissions

# --- Existing Endpoints ---

@router.get("/submissions/{submission_id}", response_model=submission_schema.Submission)
def get_my_submission_details(
    *,
    db: Annotated[Session, Depends(deps.get_db)],
    submission_id: uuid.UUID,
    current_student: Annotated[User, Depends(deps.get_current_student)],
):
    """
    Retrieve a specific graded submission belonging to the current student.
    (Student only)
    """
    submission = submission_service.get_submission_by_id_and_student(
        db=db, submission_id=submission_id, student_id=current_student.id
    )
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found.",
        )
    return submission

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
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

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
