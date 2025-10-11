# app/schemas/exam.py

import uuid
from pydantic import BaseModel
from typing import List
from app.schemas.question import Question

class Exam(BaseModel):
    id: uuid.UUID
    title: str
    status: str
    topic_id: uuid.UUID
    questions: List[Question] = []

    class Config:
        from_attributes = True
