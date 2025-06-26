from pydantic import BaseModel, EmailStr
from typing import Optional

class Profile(BaseModel):
    id: Optional[str] = None
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True



