# app/services/analytics_service.py

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from uuid import UUID
from typing import List, Dict
from datetime import date, timedelta

from app.models.course import Course
from app.models.schedule import CourseSchedule
from app.models.exam import Exam
from app.models.submission import Submission
from app.models.answer import Answer
from app.models.enrollment import enrollment

def get_course_analytics(db: Session, *, course_id: UUID, teacher_id: UUID):
    """
    Calculates and retrieves comprehensive analytics for a specific course,
    ensuring the request is made by the course's teacher.
    """
    # 1. Verify ownership and get the course with its topics and enrollments
    course = db.query(Course).options(
        joinedload(Course.students_enrolled),
        joinedload(Course.schedule)
    ).filter(Course.id == course_id, Course.teacher_id == teacher_id).first()

    if not course:
        return None

    # 2. Get all submissions related to this course by joining through topics and exams
    submissions = db.query(Submission).join(Exam).join(CourseSchedule).filter(
        CourseSchedule.course_id == course_id
    ).options(joinedload(Submission.answers)).all()

    total_submissions = len(submissions)
    total_enrollment = len(course.students_enrolled)
    
    if total_submissions == 0:
        return {
            "course_id": course.id, "course_name": course.course_name,
            "total_enrollment": total_enrollment, "total_submissions": 0,
            "average_course_score": None, "most_misunderstood_topics": [],
            "common_error_types": []
        }

    # 3. Calculate overall course average score
    overall_scores = [s.overall_score for s in submissions if s.overall_score is not None]
    average_course_score = sum(overall_scores) / len(overall_scores) if overall_scores else None

    # 4. Calculate analytics per topic
    topic_scores: Dict[UUID, List[float]] = {}
    for sub in submissions:
        if sub.exam and sub.exam.topic_id and sub.overall_score is not None:
            topic_id = sub.exam.topic_id
            if topic_id not in topic_scores:
                topic_scores[topic_id] = []
            topic_scores[topic_id].append(sub.overall_score)
    
    topic_analytics = []
    for topic in course.schedule:
        scores = topic_scores.get(topic.id)
        avg_score = sum(scores) / len(scores) if scores else None
        topic_analytics.append({
            "topic_id": topic.id, "topic_name": topic.topic_name, "average_score": avg_score
        })

    # Sort to find the most misunderstood (lowest average score, ignoring topics with no submissions)
    most_misunderstood_topics = sorted(
        [t for t in topic_analytics if t['average_score'] is not None], 
        key=lambda x: x['average_score']
    )[:3] # Get top 3

    # 5. Calculate common error types across all answers in the course
    error_type_counts = db.query(
        Answer.error_type, func.count(Answer.error_type)
    ).join(Submission).join(Exam).join(CourseSchedule).filter(
        CourseSchedule.course_id == course_id,
        Answer.error_type.isnot(None)
    ).group_by(Answer.error_type).order_by(func.count(Answer.error_type).desc()).all()

    common_error_types = [{"error_type": et, "count": count} for et, count in error_type_counts]

    return {
        "course_id": course.id, "course_name": course.course_name,
        "total_enrollment": total_enrollment,
        "total_submissions": total_submissions,
        "average_course_score": average_course_score,
        "most_misunderstood_topics": most_misunderstood_topics,
        "common_error_types": common_error_types,
    }

# --- New Student Analytics Functions ---

def get_student_upcoming_topics(db: Session, *, student_id: UUID) -> List[Dict]:
    """
    Retrieves topics from a student's enrolled courses that are due in the next 14 days.
    """
    today = date.today()
    two_weeks_from_now = today + timedelta(days=14)

    results = (
        db.query(
            CourseSchedule.topic_name,
            Course.course_name,
            CourseSchedule.end_date
        )
        .join(Course, CourseSchedule.course_id == Course.id)
        .join(enrollment, Course.id == enrollment.c.course_id)
        .filter(
            enrollment.c.student_id == student_id,
            CourseSchedule.end_date >= today,
            CourseSchedule.end_date <= two_weeks_from_now
        )
        .order_by(CourseSchedule.end_date.asc())
        .all()
    )
    return results

def get_student_performance_summary(db: Session, *, student_id: UUID) -> Dict:
    """
    Analyzes all of a student's graded answers to find the most common error type.
    """
    error_counts = (
        db.query(
            Answer.error_type,
            func.count(Answer.id).label('count')
        )
        .join(Submission, Answer.submission_id == Submission.id)
        .filter(
            Submission.student_id == student_id,
            Answer.error_type != None,
            Answer.error_type != 'correct' # Exclude correct answers
        )
        .group_by(Answer.error_type)
        .order_by(func.count(Answer.id).desc())
        .first() # Get the top one
    )

    total_graded_answers = (
         db.query(func.count(Answer.id))
        .join(Submission, Answer.submission_id == Submission.id)
        .filter(
            Submission.student_id == student_id,
            Answer.error_type != None,
        )
        .scalar()
    )

    if error_counts:
        return {
            "most_common_error": error_counts.error_type,
            "error_count": error_counts.count,
            "total_graded_answers": total_graded_answers or 0
        }
    else:
        return {
            "most_common_error": None,
            "error_count": 0,
            "total_graded_answers": total_graded_answers or 0
        }
