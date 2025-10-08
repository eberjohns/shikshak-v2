# app/schemas/token.py

from pydantic import BaseModel
import uuid

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: uuid.UUID | None = None
