# app/services/exam_service.py

from sqlalchemy.orm import Session, joinedload
from uuid import UUID
from typing import List

from app.models.course import Course
from app.models.schedule import CourseSchedule
from app.models.exam import Exam
from app.models.question import Question
from app.schemas.exam import ExamUpdate

# --- New Function ---

def get_exams_by_teacher(db: Session, *, teacher_id: UUID) -> List[Exam]:
    """
    Retrieves all exams created by a specific teacher.
    """
    return (
        db.query(Exam)
        .join(Exam.topic)
        .join(CourseSchedule.course)
        .filter(Course.teacher_id == teacher_id)
        .order_by(Exam.title) # Optional: nice to have them sorted
        .all()
    )

# --- Existing Functions ---

def get_exam_by_id_and_teacher(db: Session, *, exam_id: UUID, teacher_id: UUID) -> Exam | None:
    """
    Fetches an exam, but only if it belongs to a course taught by the specified teacher.
    """
    return (
        db.query(Exam)
        .join(Exam.topic)
        .join(CourseSchedule.course)
        .filter(Exam.id == exam_id, Course.teacher_id == teacher_id)
        .first()
    )

def update_exam(db: Session, *, db_exam: Exam, exam_in: ExamUpdate) -> Exam:
    """
    Updates an exam record in the database based on the provided data.
    """
    update_data = exam_in.model_dump(exclude_unset=True)
    for field in update_data:
        setattr(db_exam, field, update_data[field])
    
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    return db_exam

def get_topic_by_id_and_teacher(db: Session, *, topic_id: UUID, teacher_id: UUID) -> CourseSchedule | None:
    """
    Fetches a course topic, but only if it belongs to a course taught by the specified teacher.
    """
    return (
        db.query(CourseSchedule)
        .join(CourseSchedule.course)
        .filter(CourseSchedule.id == topic_id, Course.teacher_id == teacher_id)
        .options(joinedload(CourseSchedule.course))
        .first()
    )

def create_exam_draft(
    db: Session, *, topic: CourseSchedule, question_texts: List[str]
) -> Exam:
    """
    Creates a new draft exam and its questions in the database.
    """
    db_exam = Exam(
        title=f"Draft Exam: {topic.topic_name}",
        topic_id=topic.id,
        status="draft"
    )
    db.add(db_exam)
    db.flush() 

    for text in question_texts:
        db_question = Question(
            question_text=text,
            exam_id=db_exam.id
        )
        db.add(db_question)
    
    db.commit()
    db.refresh(db_exam)
    return db_exam
