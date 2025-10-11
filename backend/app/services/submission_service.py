# app/service/submission_service.py

from sqlalchemy.orm import Session, joinedload
from uuid import UUID

from app.models.user import User
from app.models.exam import Exam
from app.models.submission import Submission
from app.models.answer import Answer
from app.models.enrollment import enrollment
from app.schemas.submission import SubmissionCreate

def create_submission(db: Session, *, student: User, exam_id: UUID, submission_in: SubmissionCreate) -> Submission:
    """
    Creates a new exam submission and its associated answers in the database.
    Performs several validation checks before creating the records.
    """
    # 1. Fetch the exam, its questions, AND its topic in a single query.
    # Also ensure the exam is published.
    exam = (
        db.query(Exam)
        .options(
            joinedload(Exam.questions),
            joinedload(Exam.topic) # Explicitly load the related topic
        )
        .filter(Exam.id == exam_id, Exam.status == "published")
        .first()
    )
    if not exam:
        raise ValueError("Exam not found or is not published.")

    # 2. Securely get the course ID from the loaded topic.
    course_id = exam.topic.course_id
    if not course_id:
        # This should ideally never happen if data integrity is maintained
        raise ValueError("Could not determine the course for this exam.")

    # 3. Check if the student is enrolled in the course this exam belongs to.
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

    # 4. Check if the student has already submitted this exam.
    existing_submission = (
        db.query(Submission)
        .filter(Submission.student_id == student.id, Submission.exam_id == exam_id)
        .first()
    )
    if existing_submission:
        raise ValueError("You have already submitted this exam.")

    # 5. Validate that the number of answers matches the number of questions.
    if len(submission_in.answers) != len(exam.questions):
        raise ValueError("The number of answers does not match the number of questions in the exam.")

    # 6. Create the submission and answer records.
    db_submission = Submission(
        student_id=student.id,
        exam_id=exam_id
    )
    db.add(db_submission)
    db.flush() # Flush to get the submission ID for the answers

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
