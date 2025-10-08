# app/schemas/course.py

import uuid
from pydantic import BaseModel
from datetime import date
from app.schemas.user import UserPublic # Import the new public user schema

# Nested Schema for Schedule Topics
class ScheduleTopic(BaseModel):
    id: uuid.UUID
    topic_name: str
    topic_description: str | None = None
    end_date: date

    class Config:
        from_attributes = True

# Properties to receive on course creation
class CourseCreate(BaseModel):
    course_name: str

# Properties to return to client (e.g., for a student's enrolled courses dashboard)
class Course(BaseModel):
    id: uuid.UUID
    course_name: str
    teacher: UserPublic # Nest the teacher's public info
    schedule: list[ScheduleTopic] = []

    class Config:
        from_attributes = True

# New: A schema for the public list of all available courses
class CoursePublic(BaseModel):
    id: uuid.UUID
    course_name: str
    teacher: UserPublic # Nest the teacher's public info

    class Config:
        from_attributes = True

