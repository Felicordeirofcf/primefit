from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.db_client import get_database_client
from src.core.storage import get_storage_client
from fastapi import Body
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_admin,
    decode_token
)
import os
import uuid
import traceback

router = APIRouter()

# ---------------------------
# 📦 MODELOS
# ---------------------------

class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    endereco: str
    cidade: str
    cep: str
    telefone: str
    whatsapp: str
    tipo_usuario: str = "client"

class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str

class Token(BaseModel):
    access_token: str

class Agendamento(BaseModel):
    email_cliente: EmailStr
    data: str  # formato ISO yyyy-mm-dd

# ---------------------------
# ✅ CLIENTE - Cadastro
# ---------------------------

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UsuarioCreate):
    print("📥 Dados recebidos na rota /auth/register:", user.dict())
    db_client = get_database_client()
    try:
        existing_user = db_client.get_user_by_email(user.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email já cadastrado")

        hashed_password = hash_password(user.senha)

        user_data = {
            "nome": user.nome,
            "email": user.email,
            "senha_hash": hashed_password,
            "endereco": user.endereco,
            "cidade": user.cidade,
            "cep": user.cep,
            "telefone": user.telefone,
            "whatsapp": user.whatsapp,
            "is_admin": False,
            "treino_pdf": None,
            "tipo_usuario": user.tipo_usuario
        }

        created_user = db_client.create_user(user_data)
        return {"message": "Usuário cadastrado com sucesso!", "email": user.email}

    except HTTPException:
        raise
    except Exception as e:
        print("❌ Erro no registro:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Erro interno ao registrar usuário.")
    finally:
        db_client.close()

# ---------------------------
# 🔐 LOGIN padrão personalizado
# ---------------------------

@router.post("/login", response_model=Token)
def login(login_data: UsuarioLogin):
    print("🔐 Tentativa de login:", login_data.email)
    db_client = get_database_client()
    try:
        user = db_client.get_user_by_email(login_data.email)
        if not user or not verify_password(login_data.senha, user["senha_hash"]):
            raise HTTPException(status_code=400, detail="Credenciais inválidas")

        token = create_access_token({"sub": login_data.email})
        return {"access_token": token}

    except HTTPException:
        raise
    except Exception as e:
        print("❌ Erro no login:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Erro interno no login.")
    finally:
        db_client.close()

# ---------------------------
# 🔐 LOGIN compatível com OAuth2 (para frontend usar /auth/token)
# ---------------------------

@router.post("/token", response_model=Token)
def token_login(credentials: dict = Body(...)):
    email = credentials.get("email")
    senha = credentials.get("senha")

    print("🔐 Login JSON:", email)

    db_client = get_database_client()
    try:
        user = db_client.get_user_by_email(email)
        if not user or not verify_password(senha, user["senha_hash"]):
            raise HTTPException(status_code=400, detail="Credenciais inválidas")

        token = create_access_token({"sub": email})
        return {"access_token": token}

    except HTTPException:
        raise
    except Exception as e:
        print("❌ Erro no login JSON:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Erro interno no login.")
    finally:
        db_client.close()