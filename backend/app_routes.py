from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from src.core.db_client import get_database_client
from dotenv import load_dotenv
import os

# 🔐 Carrega variáveis do .env
load_dotenv()

router = APIRouter()

# 🧾 Modelo de entrada do usuário
class Cadastro(BaseModel):
    nome: str
    email: EmailStr
    telefone: str = ""

# ✅ Rota para cadastrar um novo usuário na tabela "usuarios"
@router.post("/cadastro", status_code=status.HTTP_201_CREATED)
async def cadastrar_usuario(data: Cadastro):
    try:
        db_client = get_database_client()
        
        # Verifica se o e-mail já existe na tabela "usuarios"
        existing_user = db_client.get_user_by_email(data.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

        # Insere os dados na tabela "usuarios"
        user_data = {
            "nome": data.nome,
            "email": data.email,
            "telefone": data.telefone,
            "senha_hash": "",  # Será definida posteriormente
            "is_admin": False
        }
        
        result = db_client.create_user(user_data)
        db_client.close()

        return {"message": "Cadastro realizado com sucesso!", "email": data.email}

    except HTTPException:
        raise
    except Exception as e:
        print("❌ ERRO:", e)
        raise HTTPException(status_code=500, detail="Erro interno ao cadastrar usuário.")
