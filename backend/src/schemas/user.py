from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Modelo para criação de usuário
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

# Modelo para resposta de usuário (sem senha)
class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Modelo para atualização de usuário
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    
    class Config:
        from_attributes = True
