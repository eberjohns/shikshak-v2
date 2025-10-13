# app/services/course_service.py

from sqlalchemy.orm import Session, joinedload
from uuid import UUID

from app.models.user import User
from app.models.course import Course
from app.models.schedule import CourseSchedule
from app.schemas.course import CourseCreate
from sqlalchemy.orm import Session, joinedload
from uuid import UUID

# --- New Function ---
def get_public_course_by_id(db: Session, *, course_id: UUID) -> Course | None:
    """
    Retrieves a single public course by its ID, eagerly loading teacher info.
    """
    return (
        db.query(Course)
        .options(joinedload(Course.teacher))
        .filter(Course.id == course_id)
        .first()
    )

# --- Student-Focused Functions ---

def get_all_courses(db: Session) -> list[Course]:
    """
    Retrieves all courses, eagerly loading teacher info to prevent extra DB queries.
    """
    return db.query(Course).options(joinedload(Course.teacher)).all()

def get_course_by_id(db: Session, course_id: UUID) -> Course | None:
    """
    Retrieves a single course by its ID.
    """
    return db.query(Course).filter(Course.id == course_id).first()

def enroll_student_in_course(db: Session, *, student: User, course: Course) -> Course:
    """
    Appends a student to a course's enrollment list and saves to the DB.
    """
    student.courses_enrolled.append(course)
    db.add(student)
    db.commit()
    db.refresh(course)
    return course

def get_courses_by_student(db: Session, *, student_id: UUID) -> list[Course]:
    """
    Retrieves all courses a specific student is enrolled in.
    """
    student = db.query(User).options(
        joinedload(User.courses_enrolled).joinedload(Course.teacher)
    ).filter(User.id == student_id).first()
    
    if not student:
        return []
    return student.courses_enrolled

def get_enrolled_course_details(db: Session, *, course_id: UUID, student_id: UUID) -> Course | None:
    """
    Retrieves a single course by its ID, but only if the student is enrolled in it.
    Eagerly loads teacher and schedule information.
    """
    return (
        db.query(Course)
        .options(
            joinedload(Course.teacher),
            joinedload(Course.schedule)
        )
        .join(Course.students_enrolled)
        .filter(Course.id == course_id, User.id == student_id)
        .first()
    )

# --- Teacher-Focused Functions ---

def get_courses_by_teacher(db: Session, *, teacher_id: UUID) -> list[Course]:
    """
    Retrieves all courses taught by a specific teacher.
    """
    return db.query(Course).options(joinedload(Course.teacher)).filter(Course.teacher_id == teacher_id).all()

def get_course_by_id_and_teacher(db: Session, *, course_id: UUID, teacher_id: UUID) -> Course | None:
    """
    Retrieves a single course by its ID, but only if it belongs to the specified teacher.
    """
    return (
        db.query(Course)
        .options(joinedload(Course.schedule)) # Eager load the schedule
        .filter(Course.id == course_id, Course.teacher_id == teacher_id)
        .first()
    )

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