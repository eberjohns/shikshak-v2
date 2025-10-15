import uuid
from pydantic import BaseModel
from datetime import date
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

class TopicPerformance(BaseModel):
    topic_id: uuid.UUID
    topic_name: str
    average_score: float

class UpcomingTopic(BaseModel):
    topic_name: str
    course_name: str
    end_date: date

    class Config:
        from_attributes = True
        
class StudentPerformanceSummary(BaseModel):
    most_common_error: Optional[str] = None
    error_count: int = 0
    total_graded_answers: int = 0
