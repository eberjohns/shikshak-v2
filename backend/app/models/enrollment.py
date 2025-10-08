# app/models/enrollment.py

from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

# This is not a model class, but a direct table definition.
# It will store the many-to-many relationship between users (students) and courses.
enrollment = Table(
    'enrollment',
    Base.metadata,
    Column('student_id', UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True),
    Column('course_id', UUID(as_uuid=True), ForeignKey('courses.id'), primary_key=True)
)
