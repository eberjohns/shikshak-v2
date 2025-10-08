# app/api/deps.py

from typing import Generator, Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.token import TokenData

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)

def get_db() -> Generator:
    """
    Dependency to get a database session.
    Yields a session and ensures it's closed after the request.
    """
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(
    db: Annotated[Session, Depends(get_db)], 
    token: Annotated[str, Depends(reusable_oauth2)]
) -> User:
    """
    Dependency to get the current user from a JWT token.
    Validates the token, extracts the user ID, and fetches the user from the DB.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenData(id=payload.get("sub"))
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if token_data.id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == token_data.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_current_teacher(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """
    Dependency to ensure the current user is a teacher.
    Relies on get_current_user and then checks the user's role.
    """
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges for this action.",
        )
    return current_user

def get_current_student(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """
    Dependency to ensure the current user is a student.
    Relies on get_current_user and then checks the user's role.
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges for this action.",
        )
    return current_user

