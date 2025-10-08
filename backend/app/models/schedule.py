# app/models/schedule.py

import uuid
from sqlalchemy import Column, String, ForeignKey, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class CourseSchedule(Base):
    __tablename__ = "course_schedule"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_name = Column(String, nullable=False)
    topic_description = Column(Text)
    end_date = Column(Date, nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))

    # Relationship
    course = relationship("Course", back_populates="schedule")
