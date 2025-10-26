# app/schemas/question.py

import uuid
from pydantic import BaseModel
from typing import Optional

class QuestionBase(BaseModel):
    question_text: str
    correct_answer: Optional[str] = None
    marks: Optional[int] = None

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    correct_answer: Optional[str] = None
    marks: Optional[int] = None

class Question(QuestionBase):
    id: uuid.UUID
    exam_id: uuid.UUID

    class Config:
        from_attributes = True
