from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from supabase import create_client, Client
from dotenv import load_dotenv
from supabase_client import supabase
import os

# 🔐 Carrega variáveis do .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise EnvironmentError("As variáveis SUPABASE_URL e SUPABASE_KEY devem estar configuradas.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

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
        # Verifica se o e-mail já existe na tabela "usuarios"
        check = supabase.table("usuarios").select("id").eq("email", data.email).execute()
        if check.data:
            raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

        # Insere os dados na tabela "usuarios"
        result = supabase.table("usuarios").insert({
            "nome": data.nome,
            "email": data.email,
            "telefone": data.telefone,
        }).execute()

        if result.data is None:
            raise HTTPException(status_code=400, detail="Erro ao inserir dados.")

        return {"message": "Cadastro realizado com sucesso!", "email": data.email}

    except Exception as e:
        print("❌ ERRO:", e)
        raise HTTPException(status_code=500, detail="Erro interno ao cadastrar usuário.")
