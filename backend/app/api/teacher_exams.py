# app/api/teacher_exams.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated, List
import uuid

from app.api import deps
from app.models.user import User
from app.schemas import exam as exam_schema
from app.services import ai_service, exam_service

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
    # Verify the exam exists and belongs to the current teacher
    db_exam = exam_service.get_exam_by_id_and_teacher(
        db=db, exam_id=exam_id, teacher_id=current_teacher.id
    )
    if not db_exam:
        raise HTTPException(status_code=404, detail="Exam not found or you do not have permission to access it.")
    
    # Perform the update
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
    # 1. Verify the topic exists and belongs to the teacher
    topic = exam_service.get_topic_by_id_and_teacher(
        db=db, topic_id=topic_id, teacher_id=current_teacher.id
    )
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found or you do not have permission to access it.")

    # 2. Call the AI service to generate questions
    question_texts = await ai_service.generate_exam_questions(
        course_name=topic.course.course_name,
        topic_name=topic.topic_name
    )

    # 3. Create the exam and questions in the database
    exam = exam_service.create_exam_draft(
        db=db, topic=topic, question_texts=question_texts
    )

    return exam
