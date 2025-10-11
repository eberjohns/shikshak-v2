# app/models/user.py

import uuid
from sqlalchemy import Column, String, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.enrollment import enrollment

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    role = Column(Enum("teacher", "student", name="user_role"), nullable=False)

    # Relationship for teachers
    courses_taught = relationship("Course", back_populates="teacher")

    # Relationship for students
    courses_enrolled = relationship(
        "Course",
        secondary=enrollment,
        back_populates="students_enrolled"
    )
    
    submissions = relationship("Submission", back_populates="student")

