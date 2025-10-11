# app/models/answer.py

import uuid
from sqlalchemy import Column, ForeignKey, Text, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class Answer(Base):
    __tablename__ = "answers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    answer_text = Column(Text, nullable=False)

    # AI-populated fields (will be null initially)
    feedback = Column(Text, nullable=True)
    error_type = Column(String, nullable=True) # e.g., conceptual, procedural

    # Foreign Keys
    submission_id = Column(UUID(as_uuid=True), ForeignKey("submissions.id"))
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"))

    # Relationships
    submission = relationship("Submission", back_populates="answers")
    question = relationship("Question", back_populates="answers")
