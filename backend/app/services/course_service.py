# app/services/course_service.py

from sqlalchemy.orm import Session, joinedload
from app.models.user import User
from app.models.course import Course
from app.models.schedule import CourseSchedule
from app.schemas.course import CourseCreate
import uuid

# --- Student-Focused Functions ---

def get_all_courses(db: Session) -> list[Course]:
    """
    Retrieves all courses, eagerly loading teacher info to prevent extra DB queries.
    """
    return db.query(Course).options(joinedload(Course.teacher)).all()

def get_course_by_id(db: Session, course_id: uuid.UUID) -> Course | None:
    """
    Retrieves a single course by its ID.
    """
    return db.query(Course).filter(Course.id == course_id).first()

def enroll_student_in_course(db: Session, *, student: User, course: Course) -> Course:
    """
    Appends a student to a course's enrollment list and saves to the DB.
    """
    course.students_enrolled.append(student)
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

def get_courses_by_student(db: Session, *, student_id: uuid.UUID) -> list[Course]:
    """
    Retrieves all courses a specific student is enrolled in.
    """

    student = db.query(User).options(
        joinedload(User.courses_enrolled).joinedload(Course.teacher)
    ).filter(User.id == student_id).first()
    
    if not student:
        return []
    return student.courses_enrolled

# This is the new function
def get_enrolled_course_details(db: Session, *, course_id: uuid.UUID, student_id: uuid.UUID) -> Course | None:
    """
    Retrieves a single course's details, but only if the specified student is enrolled.
    This is a crucial security check.
    """
    course = db.query(Course).options(
        joinedload(Course.teacher),
        joinedload(Course.schedule),
        joinedload(Course.students_enrolled) # Eager load students for the check
    ).filter(Course.id == course_id).first()
    
    if not course:
        return None

    # Check if the student's ID is in the list of enrolled student IDs
    is_enrolled = any(student.id == student_id for student in course.students_enrolled)

    if not is_enrolled:
        return None # Return None if the student is not enrolled

    return course

# --- Teacher-Focused Functions ---

def get_courses_by_teacher(db: Session, *, teacher_id: uuid.UUID) -> list[Course]:
    """
    Retrieves all courses taught by a specific teacher.
    """
    return db.query(Course).options(joinedload(Course.teacher)).filter(Course.teacher_id == teacher_id).all()

def create_course_with_schedule(
    db: Session, *, course_in: CourseCreate, teacher: User, schedule_data: list[dict]
) -> Course:
    """
    Creates a new course and its associated schedule in the database.
    """
    db_course = Course(course_name=course_in.course_name, teacher_id=teacher.id)
    db.add(db_course)
    db.commit()

    for topic in schedule_data:
        db_topic = CourseSchedule(
            course_id=db_course.id,
            topic_name=topic.get("topic_name"),
            topic_description=topic.get("topic_description"),
            end_date=topic.get("end_date")
        )
        db.add(db_topic)
    
    db.commit()
    db.refresh(db_course)
    return db_course

