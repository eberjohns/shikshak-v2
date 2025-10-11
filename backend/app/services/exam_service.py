# app/services/exam_service.py

from sqlalchemy.orm import Session, joinedload
from uuid import UUID
from typing import List

from app.models.course import Course
from app.models.schedule import CourseSchedule
from app.models.exam import Exam
from app.models.question import Question

def get_topic_by_id_and_teacher(db: Session, *, topic_id: UUID, teacher_id: UUID) -> CourseSchedule | None:
    """
    Fetches a course topic, but only if it belongs to a course taught by the specified teacher.
    This is a crucial security check.
    """
    return (
        db.query(CourseSchedule)
        .join(CourseSchedule.course)
        .filter(CourseSchedule.id == topic_id, Course.teacher_id == teacher_id)
        .options(joinedload(CourseSchedule.course)) # Eager load the course info
        .first()
    )

def create_exam_draft(
    db: Session, *, topic: CourseSchedule, question_texts: List[str]
) -> Exam:
    """
    Creates a new draft exam and its questions in the database.
    """
    # Create the parent Exam record
    db_exam = Exam(
        title=f"Draft Exam: {topic.topic_name}",
        topic_id=topic.id,
        status="draft"
    )
    db.add(db_exam)
    db.flush() # Use flush to get the db_exam.id before the transaction is committed

    # Create the child Question records
    for text in question_texts:
        db_question = Question(
            question_text=text,
            exam_id=db_exam.id
        )
        db.add(db_question)
    
    db.commit()
    db.refresh(db_exam)
    return db_exam
