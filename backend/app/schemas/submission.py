# app/schemas/submission.py

import uuid
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.answer import Answer, AnswerCreate

# Schema for the request body when a student submits an exam
class SubmissionCreate(BaseModel):
    answers: List[AnswerCreate]

# Schema for returning a created submission to the client
class Submission(BaseModel):
    id: uuid.UUID
    submitted_at: datetime
    student_id: uuid.UUID
    exam_id: uuid.UUID
    overall_score: Optional[float] = None
    overall_feedback: Optional[str] = None
    answers: List[Answer] = []

    class Config:
        from_attributes = True
