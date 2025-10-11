# app/api/router.py

from fastapi import APIRouter
from app.api import auth, courses, student_courses, teacher_exams # Import the new router

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(courses.router, prefix="/teacher/courses", tags=["Teacher - Courses"])
api_router.include_router(student_courses.router, prefix="/student", tags=["Student - Courses"])
api_router.include_router(teacher_exams.router, prefix="/teacher", tags=["Teacher - Exams"]) # Add the new router
