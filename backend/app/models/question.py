# app/models/question.py

import uuid
from sqlalchemy import Column, String, ForeignKey, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_text = Column(Text, nullable=False)
    exam_id = Column(UUID(as_uuid=True), ForeignKey("exams.id"))

    # Relationships
    exam = relationship("Exam", back_populates="questions")
    question_text = Column(Text, nullable=False)
    # New relationship to see all answers for this question
    answers = relationship("Answer", back_populates="question")
    correct_answer = Column(Text, nullable=True)
    marks = Column(Integer, nullable=False, default=1)