# app/schemas/feedback.py

from pydantic import BaseModel, Field
from typing import Literal

# This schema defines the structured JSON object we expect from the AI for each answer.
class AIFeedback(BaseModel):
    score: int = Field(
        ...,
        description="An integer score for the answer, from 0 to 10, where 10 is a perfect answer."
    )
    feedback: str = Field(
        ...,
        description="Detailed, constructive feedback for the student explaining why they received this score."
    )
    error_type: Literal["correct", "conceptual", "procedural", "interpretational", "incomplete"] = Field(
        ...,
        description="The primary type of error made. 'correct' if the answer is good."
    )
