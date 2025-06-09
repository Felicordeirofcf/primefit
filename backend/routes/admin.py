from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from auth import require_admin
from src.core.db_client import get_database_client
from datetime import datetime
import os

router = APIRouter()

# 🔐 Hasher de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 📦 Modelo para criação de novo admin
class NovoAdmin(BaseModel):
    email: EmailStr
    senha: str

# =============================
# 🔐 CRIAR NOVO ADMINISTRADOR
# =============================
@router.post("/criar", dependencies=[Depends(require_admin)])
async def criar_admin(data: NovoAdmin):
    try:
        db_client = get_database_client()
        
        # Verificar se email já existe
        existing_user = db_client.get_user_by_email(data.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Esse e-mail já está cadastrado")

        hashed = pwd_context.hash(data.senha)

        novo_admin = {
            "nome": "Administrador",
            "email": data.email,
            "senha_hash": hashed,
            "endereco": "Admin Street",
            "cidade": "Adminville",
            "cep": "00000-000",
            "telefone": "000000000",
            "whatsapp": "000000000",
            "is_admin": True,
            "treino_pdf": None
        }

        db_client.create_user(novo_admin)
        db_client.close()
        
        return {"message": "Novo administrador criado com sucesso!"}

    except HTTPException:
        raise
    except Exception as e:
        print("❌ Erro ao criar admin:", e)
        raise HTTPException(status_code=500, detail=f"Erro ao criar admin: {str(e)}")

# =============================
# 📋 LISTAR CLIENTES
# =============================
@router.get("/clientes", dependencies=[Depends(require_admin)])
async def listar_clientes():
    try:
        db_client = get_database_client()
        users = db_client.get_all_users()
        
        # Remover senhas do retorno
        for user in users:
            user.pop("senha_hash", None)
        
        db_client.close()
        return users
        
    except Exception as e:
        print("❌ Erro ao listar clientes:", e)
        raise HTTPException(status_code=500, detail=f"Erro ao listar clientes: {str(e)}")

# =============================
# 📤 ENVIAR TREINO E REGISTRAR HISTÓRICO
# =============================
@router.post("/enviar-treino/{cliente_email}", dependencies=[Depends(require_admin)])
async def enviar_treino(cliente_email: str, treino: dict):
    try:
        db_client = get_database_client()
        
        # Atualizar dados do cliente
        updates = {
            "treino_pdf": treino.get("treino_pdf")
        }
        
        db_client.update_user(cliente_email, updates)
        db_client.close()

        # Log do histórico (pode ser implementado em tabela específica se necessário)
        print(f"📝 Treino enviado para {cliente_email} - Admin")

        return {"message": "Treino enviado com sucesso!"}
        
    except Exception as e:
        print("❌ Erro ao enviar treino:", e)
        raise HTTPException(status_code=500, detail=f"Erro ao enviar treino: {str(e)}")

# =============================
# 📖 HISTÓRICO DE ALTERAÇÕES
# =============================
@router.get("/historico/{email_cliente}", dependencies=[Depends(require_admin)])
async def obter_historico(email_cliente: str):
    try:
        # TODO: Implementar tabela de histórico se necessário
        return {"message": "Histórico não implementado ainda", "cliente": email_cliente}
        
    except Exception as e:
        print("❌ Erro ao obter histórico:", e)
        raise HTTPException(status_code=500, detail=f"Erro ao obter histórico: {str(e)}")

# =============================
# 📅 EVENTOS AGENDADOS
# =============================
@router.get("/eventos/{email_cliente}", dependencies=[Depends(require_admin)])
async def listar_eventos_cliente(email_cliente: str):
    try:
        db_client = get_database_client()
        # TODO: Implementar busca de eventos se necessário
        db_client.close()
        return {"message": "Eventos não implementados ainda", "cliente": email_cliente}
    except Exception as e:
        print("❌ Erro ao buscar eventos:", e)
        raise HTTPException(status_code=500, detail=f"Erro ao buscar eventos: {str(e)}")

# =============================
# 🧪 INSERIR HISTÓRICO TESTE
# =============================
@router.post("/historico/teste", dependencies=[Depends(require_admin)])
async def inserir_historico_teste():
    try:
        # TODO: Implementar tabela de histórico se necessário
        print("📝 Histórico de teste - funcionalidade não implementada")
        return {"message": "Registro de teste simulado com sucesso!"}
    except Exception as e:
        print("❌ Erro no teste:", e)
        raise HTTPException(status_code=500, detail=f"Erro ao inserir histórico de teste: {str(e)}")

# =============================
# 📁 LISTAR TREINOS ENVIADOS
# =============================
@router.get("/treinos-enviados", dependencies=[Depends(require_admin)])
async def listar_treinos_enviados(cliente_email: str = Query(...)):
    try:
        db_client = get_database_client()
        trainings = db_client.get_trainings_by_client_email(cliente_email)
        db_client.close()
        return trainings
        
    except Exception as e:
        print("❌ Erro ao listar treinos:", e)
        raise HTTPException(status_code=500, detail=f"Erro ao listar treinos enviados: {str(e)}")
