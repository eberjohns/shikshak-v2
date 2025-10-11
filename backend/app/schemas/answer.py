# app/schemas/answer.py

import uuid
from pydantic import BaseModel
from typing import Optional

# Schema for receiving an answer in a submission
class AnswerCreate(BaseModel):
    question_id: uuid.UUID
    answer_text: str

# Schema for returning an answer to the client
class Answer(BaseModel):
    id: uuid.UUID
    answer_text: str
    question_id: uuid.UUID
    feedback: Optional[str] = None
    error_type: Optional[str] = None

    class Config:
        from_attributes = True
