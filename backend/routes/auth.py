from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from src.core.db_client import get_database_client
from auth import (
    hash_password,
    verify_password,
    create_access_token
)
import traceback
from fastapi.security import OAuth2PasswordRequestForm # Importar OAuth2PasswordRequestForm

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
    token_type: str = "bearer"

# ---------------------------
# ✅ REGISTRO DE USUÁRIO
# ---------------------------

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UsuarioCreate):
    print("📥 Registro:", user.dict())
    db_client = get_database_client()
    try:
        if db_client.get_user_by_email(user.email):
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

        db_client.create_user(user_data)
        return {"message": "Usuário cadastrado com sucesso!", "email": user.email}

    except Exception as e:
        print("❌ Erro no registro:", traceback.format_exc())
        raise HTTPException(status_code=500, detail="Erro interno ao registrar usuário.")
    finally:
        db_client.close()

# ---------------------------
# 🔐 LOGIN (JSON)
# ---------------------------

@router.post("/login", response_model=Token)
def login(login_data: UsuarioLogin):
    print("🔐 Login JSON:", login_data.email)
    db_client = get_database_client()
    try:
        user = db_client.get_user_by_email(login_data.email)
        if not user or not verify_password(login_data.senha, user["senha_hash"]):
            raise HTTPException(status_code=400, detail="Credenciais inválidas")

        token = create_access_token({"sub": login_data.email})
        return {"access_token": token, "token_type": "bearer"}

    except Exception as e:
        print("❌ Erro no login:", traceback.format_exc())
        raise HTTPException(status_code=500, detail="Erro interno no login.")
    finally:
        db_client.close()

# ---------------------------
# 🔐 LOGIN compatível com /auth/token (Form Data)
# ---------------------------

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    user = db.query(Profile).filter(Profile.email == form_data.username).first()

    if not user:
        raise HTTPException(status_code=400, detail="Usuário não encontrado")

    if not user.senha_hash:
        raise HTTPException(status_code=500, detail="Senha não está configurada para este usuário")

    try:
        if not verify_password(form_data.password, user.senha_hash):
            raise HTTPException(status_code=400, detail="Credenciais inválidas")
    except Exception as e:
        print("❌ Erro ao verificar senha:", e)
        raise HTTPException(status_code=500, detail="Erro interno na verificação da senha")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


