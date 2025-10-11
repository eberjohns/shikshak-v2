# app/api/teacher_exams.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated
import uuid

from app.api import deps
from app.models.user import User
from app.schemas import exam as exam_schema
from app.services import ai_service, exam_service

router = APIRouter()

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
