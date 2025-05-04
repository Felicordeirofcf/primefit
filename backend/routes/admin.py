from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from auth import require_admin
from supabase import create_client
from datetime import datetime
import os

router = APIRouter()

# 🔗 Conexão com Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL e SUPABASE_KEY devem estar configuradas.")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

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
        existe = supabase.table("usuarios").select("id").eq("email", data.email).execute()
        if existe.data:
            raise HTTPException(status_code=400, detail="Esse e-mail já está cadastrado")

        hashed = pwd_context.hash(data.senha)

        novo_admin = {
            "nome": "Administrador",
            "email": data.email,
            "senha": hashed,
            "endereco": "Admin Street",
            "cidade": "Adminville",
            "cep": "00000-000",
            "telefone": "000000000",
            "whatsapp": "000000000",
            "plano": "admin",
            "status_plano": "ativo",
            "treino_pdf": None,
            "link_app": None
        }

        supabase.table("usuarios").insert(novo_admin).execute()
        return {"message": "Novo administrador criado com sucesso!"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar admin: {str(e)}")

# =============================
# 📋 LISTAR CLIENTES
# =============================
@router.get("/clientes", dependencies=[Depends(require_admin)])
async def listar_clientes():
    try:
        response = supabase.table("usuarios").select("*").execute()
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar clientes: {str(e)}")

# =============================
# 📤 ENVIAR TREINO E REGISTRAR HISTÓRICO
# =============================
@router.post("/enviar-treino/{cliente_email}", dependencies=[Depends(require_admin)])
async def enviar_treino(cliente_email: str, treino: dict):
    try:
        supabase.table("usuarios").update({
            "link_app": treino.get("link_app"),
            "plano": treino.get("plano"),
            "status_plano": "ativo"
        }).eq("email", cliente_email).execute()

        supabase.table("historico_alteracoes").insert({
            "tipo": "envio_treino",
            "detalhe": f"Plano: {treino.get('plano')}",
            "autor": "admin@prime.com",
            "data": datetime.utcnow().isoformat(),
            "email_cliente": cliente_email
        }).execute()

        return {"message": "Treino enviado e histórico registrado com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao enviar treino: {str(e)}")

# =============================
# 📖 HISTÓRICO DE ALTERAÇÕES
# =============================
@router.get("/historico/{email_cliente}", dependencies=[Depends(require_admin)])
async def obter_historico(email_cliente: str):
    try:
        response = (
            supabase.table("historico_alteracoes")
            .select("*")
            .eq("email_cliente", email_cliente)
            .order("data", desc=True)
            .execute()
        )
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter histórico: {str(e)}")

# =============================
# 📅 EVENTOS AGENDADOS
# =============================
@router.get("/eventos/{email_cliente}", dependencies=[Depends(require_admin)])
async def listar_eventos_cliente(email_cliente: str):
    try:
        response = (
            supabase.table("eventos")
            .select("*")
            .eq("email_cliente", email_cliente)
            .order("data", desc=True)
            .execute()
        )
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar eventos: {str(e)}")

# =============================
# 🧪 INSERIR HISTÓRICO TESTE
# =============================
@router.post("/historico/teste", dependencies=[Depends(require_admin)])
async def inserir_historico_teste():
    try:
        registro = {
            "tipo": "envio_treino",
            "detalhe": "Plano: Consultoria Teste",
            "autor": "admin@prime.com",
            "data": datetime.utcnow().isoformat(),
            "email_cliente": "admin@teste.com"
        }

        response = supabase.table("historico_alteracoes").insert(registro).execute()
        return {"message": "Registro de teste inserido com sucesso!", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao inserir histórico de teste: {str(e)}")

# =============================
# 📁 LISTAR TREINOS ENVIADOS (SUPABASE)
# =============================
@router.get("/treinos-enviados", dependencies=[Depends(require_admin)])
async def listar_treinos_enviados(cliente_email: str = Query(...)):
    try:
        response = (
            supabase
            .table("treinos_enviados")
            .select("*")
            .eq("cliente_email", cliente_email)
            .order("enviado_em", desc=True)
            .execute()
        )
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar treinos enviados: {str(e)}")
