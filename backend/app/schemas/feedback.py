# app/schemas/feedback.py

from pydantic import BaseModel, Field
from typing import Literal

# This schema defines the structured JSON object we expect from the AI for each answer.
class AIFeedback(BaseModel):
    score: int = Field(
        ...,
        description="An integer score for the answer, from 0 to 10, where 10 is a perfect answer."
    )
    awarded_marks: float = Field(
        ...,
        description="The number of marks awarded to the student for this answer, out of the question's total marks. Should be between 0 and the question's marks."
    )
    feedback: str = Field(
        ...,
        description="Detailed, constructive feedback for the student explaining why they received this score."
    )
    error_type: Literal["correct", "conceptual", "procedural", "interpretational", "incomplete"] = Field(
        ...,
        description="The primary type of error made. 'correct' if the answer is good."
    )
