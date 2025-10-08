# app/schemas/user.py

import uuid
from pydantic import BaseModel, EmailStr
from typing import Literal

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str
    role: Literal["teacher", "student"]

# Properties to return to client (main user object)
class User(UserBase):
    id: uuid.UUID
    role: Literal["teacher", "student"]

    class Config:
        from_attributes = True

# New: A safe, public representation of a user (e.g., for showing a teacher's name)
class UserPublic(BaseModel):
    id: uuid.UUID
    full_name: str | None = None

    class Config:
        from_attributes = True

