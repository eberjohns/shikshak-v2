# app/schemas/submission.py

import uuid
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.answer import Answer, AnswerCreate
from app.schemas.user import UserPublic

# --- New Schema for the Teacher's Dashboard ---

class SubmissionForTeacher(BaseModel):
    id: uuid.UUID
    submitted_at: datetime
    overall_score: Optional[float] = None
    student: UserPublic

    class Config:
        from_attributes = True

# --- Existing Summary Schemas for the List View ---

class ExamSummary(BaseModel):
    id: uuid.UUID
    title: str

    class Config:
        from_attributes = True

class SubmissionSummary(BaseModel):
    id: uuid.UUID
    submitted_at: datetime
    overall_score: Optional[float] = None
    exam: ExamSummary

    class Config:
        from_attributes = True

# --- Existing Detailed Schemas ---

class SubmissionCreate(BaseModel):
    answers: List[AnswerCreate]

class Submission(BaseModel):
    id: uuid.UUID
    submitted_at: datetime
    overall_score: Optional[float] = None
    overall_feedback: Optional[str] = None
    exam: ExamSummary
    answers: List[Answer] = []

    class Config:
        from_attributes = True
