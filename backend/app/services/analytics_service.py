from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from uuid import UUID
from typing import List, Dict

from app.models.course import Course
from app.models.schedule import CourseSchedule
from app.models.exam import Exam
from app.models.submission import Submission
from app.models.answer import Answer

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
