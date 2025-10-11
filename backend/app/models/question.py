# app/models/question.py

import uuid
from sqlalchemy import Column, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_text = Column(Text, nullable=False)
    
    # Foreign key to link this question to a specific exam
    exam_id = Column(UUID(as_uuid=True), ForeignKey("exams.id"))

    # Relationship
    exam = relationship("Exam", back_populates="questions")
