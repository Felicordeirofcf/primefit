from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.db_client import get_database_client
from src.core.storage import get_storage_client
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

class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str

class Token(BaseModel):
    access_token: str

class Agendamento(BaseModel):
    email_cliente: EmailStr
    data: str  # formato ISO yyyy-mm-dd

# ---------------------------
# ✅ CLIENTE - Cadastro e login
# ---------------------------

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UsuarioCreate):
    try:
        db_client = get_database_client()
        
        # Verificar se email já existe
        existing_user = db_client.get_user_by_email(user.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email já cadastrado")

        # Hash da senha
        hashed_password = hash_password(user.senha)
        
        # Dados do usuário
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
            "treino_pdf": None
        }

        # Criar usuário
        created_user = db_client.create_user(user_data)
        db_client.close()
        
        return {"message": "Usuário cadastrado com sucesso!", "email": user.email}
    
    except HTTPException:
        raise
    except Exception as e:
        print("❌ Erro no registro:", e)
        raise HTTPException(status_code=500, detail="Erro interno ao registrar usuário.")

@router.post("/login", response_model=Token)
def login(login_data: UsuarioLogin):
    try:
        db_client = get_database_client()
        
        # Buscar usuário
        user = db_client.get_user_by_email(login_data.email)
        if not user:
            raise HTTPException(status_code=400, detail="Credenciais inválidas")

        # Verificar senha
        if not verify_password(login_data.senha, user["senha_hash"]):
            raise HTTPException(status_code=400, detail="Credenciais inválidas")

        # Criar token
        token = create_access_token({"sub": login_data.email})
        db_client.close()
        
        return {"access_token": token}
    
    except HTTPException:
        raise
    except Exception as e:
        print("❌ Erro no login:", e)
        raise HTTPException(status_code=500, detail="Erro interno no login.")

# ---------------------------
# ✅ CLIENTE - Dashboard
# ---------------------------

@router.get("/clientes/me")
def get_cliente_autenticado(token: str = Depends(get_current_user)):
    try:
        db_client = get_database_client()
        
        user = db_client.get_user_by_email(token)
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")

        # Remover senha do retorno
        user.pop("senha_hash", None)
        db_client.close()
        
        return user
    
    except HTTPException:
        raise
    except Exception as e:
        print("❌ Erro ao buscar usuário:", e)
        raise HTTPException(status_code=500, detail="Erro interno.")

@router.put("/clientes/update")
def atualizar_cliente(dados: dict, email: str = Depends(get_current_user)):
    try:
        campos_permitidos = {"endereco", "cep", "telefone", "whatsapp"}
        atualizacoes = {k: v for k, v in dados.items() if k in campos_permitidos}

        if not atualizacoes:
            raise HTTPException(status_code=400, detail="Nenhum campo permitido para atualização.")

        db_client = get_database_client()
        
        # Atualizar usuário
        updated_user = db_client.update_user(email, atualizacoes)
        updated_user.pop("senha_hash", None)
        db_client.close()
        
        return updated_user
    
    except HTTPException:
        raise
    except Exception as e:
        print("❌ Erro ao atualizar usuário:", e)
        raise HTTPException(status_code=500, detail="Erro interno.")

# ---------------------------
# ✅ UPLOAD de DOCUMENTOS
# ---------------------------

@router.post("/upload_docs")
def upload_docs(email: str = Form(...), file: UploadFile = File(...)):
    try:
        # Ler conteúdo do arquivo
        contents = file.file.read()
        
        # Gerar nome único para o arquivo
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'pdf'
        unique_filename = f"{email.replace('@', '_')}_{uuid.uuid4().hex[:8]}.{file_extension}"
        
        # Upload para storage local
        storage_client = get_storage_client()
        upload_result = storage_client.upload(
            bucket="arquivos",
            file_path=f"treinos/{unique_filename}",
            file_content=contents,
            content_type=file.content_type
        )
        
        # Gerar URL pública
        public_url = storage_client.get_public_url("arquivos", f"treinos/{unique_filename}")
        
        # Atualizar usuário com URL do PDF
        db_client = get_database_client()
        db_client.update_user(email, {"treino_pdf": public_url})
        db_client.close()
        
        return {"message": "Arquivo enviado com sucesso!", "url": public_url}
    
    except Exception as e:
        print("❌ Erro no upload:", e)
        raise HTTPException(status_code=500, detail=f"Erro no upload: {str(e)}")

# ---------------------------
# ✅ ADMIN - Gerenciamento
# ---------------------------

@router.get("/admin/clientes")
def listar_clientes(admin_email: str = Depends(require_admin)):
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
        raise HTTPException(status_code=500, detail="Erro interno.")

@router.put("/admin/atualizar")
def atualizar_dados_cliente(payload: dict, admin_email: str = Depends(require_admin)):
    try:
        email_cliente = payload.get("email")
        if not email_cliente:
            raise HTTPException(status_code=400, detail="E-mail do cliente é obrigatório.")

        campos_permitidos = {"treino_pdf"}  # Campos que admin pode atualizar
        atualizacoes = {k: v for k, v in payload.items() if k in campos_permitidos and v is not None}

        if not atualizacoes:
            raise HTTPException(status_code=400, detail="Nenhum campo permitido enviado.")

        db_client = get_database_client()
        
        updated_user = db_client.update_user(email_cliente, atualizacoes)
        updated_user.pop("senha_hash", None)
        db_client.close()
        
        return updated_user
    
    except HTTPException:
        raise
    except Exception as e:
        print("❌ Erro ao atualizar cliente:", e)
        raise HTTPException(status_code=500, detail="Erro interno.")

@router.post("/admin/agendar-revisao")
def agendar_revisao(agendamento: Agendamento, admin_email: str = Depends(require_admin)):
    try:
        db_client = get_database_client()
        
        event_data = {
            "email_cliente": agendamento.email_cliente,
            "data": agendamento.data,
            "tipo": "revisao",
            "status": "agendado"
        }
        
        db_client.create_event(event_data)
        db_client.close()
        
        return {"message": "Revisão agendada com sucesso!"}
    
    except Exception as e:
        print("❌ Erro ao agendar revisão:", e)
        raise HTTPException(status_code=500, detail=f"Erro ao agendar revisão: {str(e)}")
