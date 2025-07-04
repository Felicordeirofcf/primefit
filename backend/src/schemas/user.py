"""
Esquemas para usuários e autenticação
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum # Importar Enum

class RoleEnum(str, Enum):
    admin = "admin"
    cliente = "cliente"

class UserBase(BaseModel):
    """Esquema base para usuários"""
    email: EmailStr

class UserCreate(UserBase):
    """Esquema para criação de usuários"""
    nome: str
    senha: str = Field(..., min_length=6)
    whatsapp: Optional[str] = None
    tipo_usuario: Optional[str] = "client" # Mantido para compatibilidade, mas role será o principal
    role: RoleEnum = RoleEnum.cliente # Usar o Enum para role
    endereco: Optional[str] = None
    cidade: Optional[str] = None
    cep: Optional[str] = None
    telefone: Optional[str] = None

class UserLogin(UserBase):
    """Esquema para login de usuários"""
    senha: str

class UserUpdate(BaseModel):
    """Esquema para atualização de usuários"""
    email: Optional[EmailStr] = None
    senha: Optional[str] = Field(None, min_length=6)
    is_active: Optional[bool] = None
    role: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    """Esquema para token de acesso"""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Esquema para dados do token"""
    email: Optional[str] = None
    user_id: Optional[str] = None
    role: Optional[str] = None

class ProfileBase(BaseModel):
    """Esquema base para perfis"""
    nome: Optional[str] = None
    email: EmailStr
    telefone: Optional[str] = None
    objetivo: Optional[str] = None
    avatar_url: Optional[str] = None

class ProfileCreate(ProfileBase):
    """Esquema para criação de perfis"""
    user_id: str

class ProfileUpdate(BaseModel):
    """Esquema para atualização de perfis"""
    nome: Optional[str] = None
    telefone: Optional[str] = None
    objetivo: Optional[str] = None
    avatar_url: Optional[str] = None

class ProfileResponse(ProfileBase):
    """Esquema para resposta de perfis"""
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True





class UsuarioResponse(UserBase):
    """Esquema para resposta de usuários, excluindo a senha hash"""
    id: str
    nome: str
    tipo_usuario: str
    is_admin: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    endereco: Optional[str] = None
    cidade: Optional[str] = None
    cep: Optional[str] = None
    telefone: Optional[str] = None
    whatsapp: Optional[str] = None
    role: str # Adicionado o campo role ao UsuarioResponse

    class Config:
        from_attributes = True




