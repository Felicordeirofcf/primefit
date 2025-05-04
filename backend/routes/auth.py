from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from pydantic import BaseModel, EmailStr
from supabase import create_client
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_admin,
    decode_token
)
import os

router = APIRouter()

# 🔐 Conexão com Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
if not supabase_url or not supabase_key:
    raise RuntimeError("SUPABASE_URL e SUPABASE_KEY devem estar configuradas.")
supabase = create_client(supabase_url, supabase_key)

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
        result = supabase.table("usuarios").select("id").eq("email", user.email).execute()
        if result.data:
            raise HTTPException(status_code=400, detail="Email já cadastrado")

        hashed_password = hash_password(user.senha)
        insert_data = {
            "nome": user.nome,
            "email": user.email,
            "senha": hashed_password,
            "endereco": user.endereco,
            "cidade": user.cidade,
            "cep": user.cep,
            "telefone": user.telefone,
            "whatsapp": user.whatsapp,
            "plano": "nenhum",
            "status_plano": "inativo",
            "treino_pdf": None,
            "link_app": None,
        }

        response = supabase.table("usuarios").insert(insert_data).execute()
        if getattr(response, "error", None):
            raise HTTPException(status_code=500, detail="Erro ao inserir no Supabase")

        return {"message": "Usuário cadastrado com sucesso!", "email": user.email}
    
    except Exception as e:
        print("❌ Erro no registro:", e)
        raise HTTPException(status_code=500, detail="Erro interno ao registrar usuário.")

@router.post("/login", response_model=Token)
def login(login_data: UsuarioLogin):
    result = supabase.table("usuarios").select("*").eq("email", login_data.email).single().execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Credenciais inválidas")

    user = result.data
    if not verify_password(login_data.senha, user["senha"]):
        raise HTTPException(status_code=400, detail="Credenciais inválidas")

    token = create_access_token({"sub": login_data.email})
    return {"access_token": token}

# ---------------------------
# ✅ CLIENTE - Dashboard
# ---------------------------

@router.get("/clientes/me")
def get_cliente_autenticado(token: str = Depends(get_current_user)):
    result = supabase.table("usuarios").select("*").eq("email", token).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    user = result.data
    user.pop("senha", None)
    return user

@router.put("/clientes/update")
def atualizar_cliente(dados: dict, email: str = Depends(get_current_user)):
    campos_permitidos = {"endereco", "cep", "telefone", "whatsapp"}
    atualizacoes = {k: v for k, v in dados.items() if k in campos_permitidos}

    if not atualizacoes:
        raise HTTPException(status_code=400, detail="Nenhum campo permitido para atualização.")

    supabase.table("usuarios").update(atualizacoes).eq("email", email).execute()
    atualizado = supabase.table("usuarios").select("*").eq("email", email).single().execute().data
    atualizado.pop("senha", None)
    return atualizado

# ---------------------------
# ✅ UPLOAD de DOCUMENTOS
# ---------------------------

@router.post("/upload_docs")
def upload_docs(email: str = Form(...), file: UploadFile = File(...)):
    try:
        contents = file.file.read()
        path = f"treinos/{email.replace('@', '_')}_{file.filename}"

        supabase.storage.from_("arquivos").upload(path, contents, {"content-type": file.content_type})
        public_url = supabase.storage.from_("arquivos").get_public_url(path)

        supabase.table("usuarios").update({"treino_pdf": public_url}).eq("email", email).execute()
        return {"message": "Arquivo enviado com sucesso!", "url": public_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no upload: {str(e)}")

# ---------------------------
# ✅ ADMIN - Gerenciamento
# ---------------------------

@router.get("/admin/clientes")
def listar_clientes(admin_email: str = Depends(require_admin)):
    result = supabase.table("usuarios").select("*").execute()
    clientes = result.data or []
    for cliente in clientes:
        cliente.pop("senha", None)
    return clientes

@router.put("/admin/atualizar")
def atualizar_dados_cliente(payload: dict, admin_email: str = Depends(require_admin)):
    email_cliente = payload.get("email")
    if not email_cliente:
        raise HTTPException(status_code=400, detail="E-mail do cliente é obrigatório.")

    campos_permitidos = {"plano", "link_app", "status_plano", "treino_pdf"}
    atualizacoes = {k: v for k, v in payload.items() if k in campos_permitidos and v is not None}

    if not atualizacoes:
        raise HTTPException(status_code=400, detail="Nenhum campo permitido enviado.")

    supabase.table("usuarios").update(atualizacoes).eq("email", email_cliente).execute()
    atualizado = supabase.table("usuarios").select("*").eq("email", email_cliente).single().execute().data
    atualizado.pop("senha", None)
    return atualizado

@router.post("/admin/agendar-revisao")
def agendar_revisao(agendamento: Agendamento, admin_email: str = Depends(require_admin)):
    try:
        evento = {
            "email_cliente": agendamento.email_cliente,
            "titulo": "Revisão de Série",
            "data": agendamento.data
        }
        supabase.table("eventos").insert(evento).execute()
        return {"message": "Revisão agendada com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao agendar revisão: {str(e)}")
