import uuid
from pydantic import BaseModel
from typing import List, Optional

class TopicAnalytics(BaseModel):
    topic_id: uuid.UUID
    topic_name: str
    average_score: Optional[float] = None

class ErrorTypeAnalytics(BaseModel):
    error_type: str
    count: int

class CourseAnalytics(BaseModel):
    course_id: uuid.UUID
    course_name: str
    total_enrollment: int
    total_submissions: int
    average_course_score: Optional[float] = None
    most_misunderstood_topics: List[TopicAnalytics] = []
    common_error_types: List[ErrorTypeAnalytics] = []

    class Config:
        from_attributes = True
