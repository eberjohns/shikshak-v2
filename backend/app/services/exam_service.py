# app/services/exam_service.py

from sqlalchemy.orm import Session, joinedload
from uuid import UUID
from typing import List

from app.models.course import Course
from app.models.schedule import CourseSchedule
from app.models.exam import Exam
from app.models.question import Question
from app.models.enrollment import enrollment
from app.schemas.exam import ExamUpdate
from app.schemas.question import QuestionCreate

# --- New Function ---

def get_published_exams_for_course(db: Session, *, course_id: UUID, student_id: UUID) -> List[Exam]:
    """
    Retrieves all published exams for a course, but only if the student is enrolled.
    Returns an empty list if the student is not enrolled or no published exams exist.
    """
    # First, run a quick check to see if an enrollment record exists.
    enrollment_check = (
        db.query(enrollment)
        .filter(
            enrollment.c.student_id == student_id,
            enrollment.c.course_id == course_id
        )
        .first()
    )

    # If the student is not enrolled in this course, return an empty list immediately.
    if not enrollment_check:
        return []

    # If they are enrolled, proceed to fetch all exams for that course
    # that have a status of "published".
    return (
        db.query(Exam)
        .join(Exam.topic)
        .filter(
            CourseSchedule.course_id == course_id,
            Exam.status == "published"
        )
        .options(joinedload(Exam.questions)) # Eagerly load questions
        .order_by(Exam.title)
        .all()
    )

# --- Existing Teacher-Focused Functions ---

def get_exam(db: Session, exam_id: UUID) -> Exam:
    """Get an exam by its ID."""
    return db.query(Exam).filter(Exam.id == exam_id).first()

def get_question(db: Session, question_id: UUID) -> Question:
    """Get a question by its ID."""
    return db.query(Question).filter(Question.id == question_id).first()

def update_question(
    db: Session,
    question: Question,
    question_update: ExamUpdate
) -> Question:
    """Update a question with the provided data."""
    for key, value in question_update.model_dump(exclude_unset=True).items():
        setattr(question, key, value)
    
    db.commit()
    db.refresh(question)
    return question

def create_question(
    db: Session,
    exam_id: UUID,
    question_create: QuestionCreate
) -> Question:
    """Create a new question for an exam."""
    question = Question(
        **question_create.model_dump(),
        exam_id=exam_id
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return question

def get_exams_by_teacher(db: Session, *, teacher_id: UUID) -> List[Exam]:
    """
    Retrieves all exams created by a specific teacher.
    """
    return (
        db.query(Exam)
        .join(Exam.topic)
        .join(CourseSchedule.course)
        .filter(Course.teacher_id == teacher_id)
        .order_by(Exam.title)
        .all()
    )

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
    Updates an exam record in the database.
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
            exam_id=db_exam.id,
            marks=1  # Default marks for AI-generated questions
        )
        db.add(db_question)
    
    db.commit()
    db.refresh(db_exam)
    return db_exam
