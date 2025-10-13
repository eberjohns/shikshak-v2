# app/api/users.py

from fastapi import APIRouter, Depends
from typing import Annotated

from app.api import deps
from app.models.user import User
from app.schemas import user as user_schema

router = APIRouter()

@router.get("/me", response_model=user_schema.User)
def read_users_me(
    current_user: Annotated[User, Depends(deps.get_current_user)],
):
    """
    Get current user details.
    """
    return current_user
