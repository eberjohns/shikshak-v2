# app/schemas/question.py

import uuid
from pydantic import BaseModel

class Question(BaseModel):
    id: uuid.UUID
    question_text: str

    class Config:
        from_attributes = True
