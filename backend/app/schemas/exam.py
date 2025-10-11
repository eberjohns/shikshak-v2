# app/schemas/exam.py

import uuid
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from app.schemas.question import Question

# This is the main schema for returning exam data.
class Exam(BaseModel):
    id: uuid.UUID
    title: str
    status: str
    grading_rules: Optional[str] = None
    topic_id: uuid.UUID
    questions: List[Question] = []

    class Config:
        from_attributes = True

# This is the new schema for the PATCH request body.
# It allows the teacher to update the status, rules, or both.
class ExamUpdate(BaseModel):
    status: Optional[Literal["draft", "published"]] = None
    grading_rules: Optional[str] = None

