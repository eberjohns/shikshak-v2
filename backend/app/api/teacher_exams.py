# app/api/teacher_exams.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated, List
import uuid

from app.api import deps
from app.models.user import User
from app.schemas import exam as exam_schema, submission as submission_schema
from app.services import ai_service, exam_service, submission_service

router = APIRouter()

@router.get("/exams", response_model=List[exam_schema.Exam])
def get_my_exams(
    *,
    db: Annotated[Session, Depends(deps.get_db)],
    current_teacher: Annotated[User, Depends(deps.get_current_teacher)],
):
    """
    Retrieve all exams created by the current teacher.
    (Teacher only)
    """
    exams = exam_service.get_exams_by_teacher(db=db, teacher_id=current_teacher.id)
    return exams

@router.patch("/exams/{exam_id}", response_model=exam_schema.Exam)
def update_exam_details(
    *,
    db: Annotated[Session, Depends(deps.get_db)],
    exam_id: uuid.UUID,
    exam_in: exam_schema.ExamUpdate,
    current_teacher: Annotated[User, Depends(deps.get_current_teacher)],
):
    """
    Update an exam's details, such as adding grading rules or publishing it.
    (Teacher only)
    """
    db_exam = exam_service.get_exam_by_id_and_teacher(
        db=db, exam_id=exam_id, teacher_id=current_teacher.id
    )
    if not db_exam:
        raise HTTPException(status_code=404, detail="Exam not found or you do not have permission to access it.")
    
    exam = exam_service.update_exam(db=db, db_exam=db_exam, exam_in=exam_in)
    return exam

@router.post("/topics/{topic_id}/generate-exam", response_model=exam_schema.Exam)
async def generate_draft_exam_for_topic(
    *,
    db: Annotated[Session, Depends(deps.get_db)],
    topic_id: uuid.UUID,
    current_teacher: Annotated[User, Depends(deps.get_current_teacher)],
):
    """
    Generates a new draft exam with 10 AI-generated questions for a specific course topic.
    (Teacher only)
    """
    topic = exam_service.get_topic_by_id_and_teacher(
        db=db, topic_id=topic_id, teacher_id=current_teacher.id
    )
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found or you do not have permission to access it.")

    question_texts = await ai_service.generate_exam_questions(
        course_name=topic.course.course_name,
        topic_name=topic.topic_name
    )

    exam = exam_service.create_exam_draft(
        db=db, topic=topic, question_texts=question_texts
    )
    return exam

@router.post("/exams/{exam_id}/grade-all", response_model=dict)
async def grade_all_exam_submissions(
    *,
    db: Annotated[Session, Depends(deps.get_db)],
    exam_id: uuid.UUID,
    current_teacher: Annotated[User, Depends(deps.get_current_teacher)],
):
    """
    Triggers the AI grading process for all ungraded submissions of a specific exam.
    This is a long-running operation. (Teacher only)
    """
    exam_check = exam_service.get_exam_by_id_and_teacher(
        db=db, exam_id=exam_id, teacher_id=current_teacher.id
    )
    if not exam_check:
        raise HTTPException(status_code=404, detail="Exam not found or you do not have permission to access it.")

    try:
        num_graded = await submission_service.grade_all_submissions_for_exam(db=db, exam_id=exam_id)
        return {"message": f"Successfully graded {num_graded} new submission(s)."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during grading: {e}")

@router.get("/exams/{exam_id}/submissions", response_model=List[submission_schema.SubmissionForTeacher])
def get_submissions_for_exam(
    *,
    db: Annotated[Session, Depends(deps.get_db)],
    exam_id: uuid.UUID,
    current_teacher: Annotated[User, Depends(deps.get_current_teacher)],
):
    """
    Retrieve all student submissions for a specific exam.
    (Teacher only)
    """
    submissions = submission_service.get_submissions_by_exam_and_teacher(
        db=db, exam_id=exam_id, teacher_id=current_teacher.id
    )
    return submissions
