from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# 📌 Modelo para criação de usuário (registro)
class UsuarioCreate(BaseModel):
    nome: str = Field(..., example="João Silva")
    email: EmailStr = Field(..., example="joao@example.com")
    senha: str = Field(..., min_length=6)
    endereco: str = Field(..., example="Rua A, 123")
    cidade: str = Field(..., example="Rio de Janeiro")
    cep: str = Field(..., example="20000-000")
    telefone: str = Field(..., example="21999998888")
    whatsapp: str = Field(..., example="21999998888")

# 🔐 Modelo para login
class UsuarioLogin(BaseModel):
    email: EmailStr = Field(..., example="joao@example.com")
    senha: str = Field(..., min_length=6)

# 🔑 Modelo para retorno do token JWT
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# 📂 Modelo de resposta de treino enviado (PDF)
class TreinoEnviadoOut(BaseModel):
    nome_arquivo: str
    url_pdf: str
    enviado_em: datetime

    class Config:
        orm_mode = True
