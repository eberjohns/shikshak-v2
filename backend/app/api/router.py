# app/api/router.py

from fastapi import APIRouter
from app.api import auth, courses, student_courses, teacher_exams, student_exams, users, public_courses

api_router = APIRouter()

# General/Public Routes
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(public_courses.router, prefix="/courses", tags=["Public Courses"])

# Teacher Routes
api_router.include_router(courses.router, prefix="/teacher/courses", tags=["Teacher - Courses"])
api_router.include_router(teacher_exams.router, prefix="/teacher", tags=["Teacher - Exams"])

# Student Routes
api_router.include_router(student_courses.router, prefix="/student", tags=["Student - Courses"])
api_router.include_router(student_exams.router, prefix="/student", tags=["Student - Exams"])
