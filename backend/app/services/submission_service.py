# app/service/submission_service.py

from sqlalchemy.orm import Session, joinedload
from uuid import UUID
import asyncio
from typing import List

from app.models.user import User
from app.models.exam import Exam
from app.models.submission import Submission
from app.models.answer import Answer
from app.models.enrollment import enrollment
from app.models.schedule import CourseSchedule
from app.models.course import Course
from app.schemas.submission import SubmissionCreate
from app.services import ai_service

# --- Student-Focused Functions ---

def get_submissions_by_student(db: Session, *, student_id: UUID) -> List[Submission]:
    """
    Retrieves all submissions made by a specific student.
    Eagerly loads the exam details for each submission.
    Orders by most recent first.
    """
    return (
        db.query(Submission)
        .options(joinedload(Submission.exam))
        .filter(Submission.student_id == student_id)
        .order_by(Submission.submitted_at.desc())
        .all()
    )

def get_submission_by_id_and_student(db: Session, *, submission_id: UUID, student_id: UUID) -> Submission | None:
    """
    Retrieves a single submission, but only if it belongs to the specified student.
    Eagerly loads all related data for the feedback report.
    """
    return (
        db.query(Submission)
        .options(
            joinedload(Submission.answers)
            .joinedload(Answer.question)
        )
        .filter(Submission.id == submission_id, Submission.student_id == student_id)
        .first()
    )

def create_submission(db: Session, *, student: User, exam_id: UUID, submission_in: SubmissionCreate) -> Submission:
    """
    Creates a new exam submission and its associated answers in the database.
    """
    exam = (
        db.query(Exam)
        .options(
            joinedload(Exam.questions),
            joinedload(Exam.topic)
        )
        .filter(Exam.id == exam_id, Exam.status == "published")
        .first()
    )
    if not exam:
        raise ValueError("Exam not found or is not published.")

    course_id = exam.topic.course_id
    if not course_id:
        raise ValueError("Could not determine the course for this exam.")

    is_enrolled = (
        db.query(enrollment)
        .filter(
            enrollment.c.student_id == student.id,
            enrollment.c.course_id == course_id
        )
        .first()
    )
    if not is_enrolled:
        raise PermissionError("You are not enrolled in the course for this exam.")

    existing_submission = (
        db.query(Submission)
        .filter(Submission.student_id == student.id, Submission.exam_id == exam_id)
        .first()
    )
    if existing_submission:
        raise ValueError("You have already submitted this exam.")

    if len(submission_in.answers) != len(exam.questions):
        raise ValueError("The number of answers does not match the number of questions in the exam.")

    db_submission = Submission(
        student_id=student.id,
        exam_id=exam_id
    )
    db.add(db_submission)
    db.flush()

    for answer_in in submission_in.answers:
        db_answer = Answer(
            answer_text=answer_in.answer_text,
            question_id=answer_in.question_id,
            submission_id=db_submission.id
        )
        db.add(db_answer)

    db.commit()
    db.refresh(db_submission)
    return db_submission

# --- Teacher-Focused Functions ---

def get_submissions_by_exam_and_teacher(db: Session, *, exam_id: UUID, teacher_id: UUID) -> List[Submission]:
    """
    Retrieves all submissions for a specific exam, but only if that exam
    belongs to the specified teacher.
    """
    return (
        db.query(Submission)
        .join(Submission.exam)
        .join(Exam.topic)
        .join(CourseSchedule.course)
        .filter(Submission.exam_id == exam_id, Course.teacher_id == teacher_id)
        .options(joinedload(Submission.student))
        .order_by(Submission.submitted_at.desc())
        .all()
    )

async def grade_all_submissions_for_exam(db: Session, exam_id: UUID) -> int:
    """
    Finds all ungraded submissions for an exam and grades them using the AI service.
    """
    exam = (
        db.query(Exam)
        .options(
            joinedload(Exam.submissions)
            .joinedload(Submission.answers)
            .joinedload(Answer.question)
        )
        .filter(Exam.id == exam_id)
        .first()
    )

    if not exam or not exam.grading_rules:
        raise ValueError("Exam not found or grading rules have not been set.")

    ungraded_submissions = [s for s in exam.submissions if s.overall_score is None]

    if not ungraded_submissions:
        return 0

    for submission in ungraded_submissions:
        grading_tasks = [
            ai_service.grade_single_answer(
                question_text=answer.question.question_text,
                answer_text=answer.answer_text,
                grading_rules=exam.grading_rules,
            )
            for answer in submission.answers
        ]
        
        feedback_results = await asyncio.gather(*grading_tasks, return_exceptions=True)

        total_score = 0
        graded_answers_summary = []
        
        for i, result in enumerate(feedback_results):
            answer = submission.answers[i]
            if isinstance(result, Exception):
                print(f"Error grading answer {answer.id}: {result}")
                answer.feedback = "Error during AI grading."
                answer.error_type = "system_error"
            else:
                answer.feedback = result.feedback
                answer.error_type = result.error_type
                total_score += result.score
                graded_answers_summary.append({
                    "question": answer.question.question_text,
                    "feedback": result.feedback,
                    "error_type": result.error_type
                })
            db.add(answer)

        if submission.answers:
            submission.overall_score = round(total_score / len(submission.answers), 2)
            submission.overall_feedback = await ai_service.generate_overall_feedback(
                graded_answers=graded_answers_summary,
                overall_score=submission.overall_score
            )
        else:
            submission.overall_score = 0
            submission.overall_feedback = "No answers were submitted for grading."
        
        db.add(submission)

    db.commit()
    return len(ungraded_submissions)
