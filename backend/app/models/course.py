# app/models/course.py

import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.enrollment import enrollment # Import the new table

class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_name = Column(String, index=True, nullable=False)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    # Existing relationships
    teacher = relationship("User", back_populates="courses_taught")
    schedule = relationship("CourseSchedule", back_populates="course", cascade="all, delete-orphan")

    # New relationship for students, linked via the 'enrollment' table
    students_enrolled = relationship(
        "User",
        secondary=enrollment,
        back_populates="courses_enrolled"
    )

