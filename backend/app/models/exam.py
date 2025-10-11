# app/models/exam.py

import uuid
from sqlalchemy import Column, String, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class Exam(Base):
    __tablename__ = "exams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    status = Column(Enum("draft", "published", name="exam_status"), nullable=False, default="draft")
    
    # Foreign key to link this exam to a specific course topic (schedule entry)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("course_schedule.id"))

    # Relationships
    topic = relationship("CourseSchedule", back_populates="exams")
    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")
