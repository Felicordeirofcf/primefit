from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from pydantic import BaseModel, EmailStr
import os
import uuid
import logging

from src.core.database import get_db
from src.schemas.models import Profile as ProfileModel, PerfilResponse
from src.core.auth_utils import verify_password, get_password_hash, create_access_token, decode_access_token

# Configuração de logging
logger = logging.getLogger(__name__)

# Patch para o erro do bcrypt
def _patch_bcrypt():
    import bcrypt
    if not hasattr(bcrypt, '__about__'):
        bcrypt.__about__ = {'__version__': bcrypt.__version__}

# Chame a função no início do arquivo
_patch_bcrypt()

router = APIRouter()

# Configuração do OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# ---------------------------
# 📦 MODELOS Pydantic
# ---------------------------

class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    tipo_usuario: str = "client"

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None

# ---------------------------
# ✅ REGISTRO DE USUÁRIO
# ---------------------------

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=PerfilResponse)
async def register(
    user: UsuarioCreate,
    db: Session = Depends(get_db)
):
    db_user = db.query(ProfileModel).filter(ProfileModel.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    hashed_password = get_password_hash(user.senha)
    
    new_user = ProfileModel(
        id=str(uuid.uuid4()),
        nome=user.nome,
        email=user.email,
        password_hash=hashed_password,
        tipo_usuario=user.tipo_usuario,
        criado_em=datetime.utcnow(),
        ultimo_login=datetime.utcnow()
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

# ---------------------------
# 🔐 LOGIN com OAuth2PasswordBearer
# ---------------------------

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(ProfileModel).filter(ProfileModel.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Usando uma constante para o tempo de expiração do token
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24 * 7))
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    access_token = create_access_token(
        data={"sub": user.email, "role": user.tipo_usuario}, expires_delta=access_token_expires
    )
    
    # Atualizar ultimo_login
    user.ultimo_login = datetime.utcnow()
    db.commit()
    db.refresh(user)

    return {"access_token": access_token, "token_type": "bearer"}

# ---------------------------
# 🔑 Funções de Autenticação (Dependencies)
# ---------------------------

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> ProfileModel:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        logger.debug(f"Recebido token: {token[:15]}...")
        payload = decode_access_token(token)
        logger.debug(f"Payload decodificado: {payload}")
        
        email: str = payload.get("sub")
        if email is None:
            logger.warning("Email não encontrado no payload do token")
            raise credentials_exception
            
        token_data = TokenData(email=email)
    except JWTError as e:
        logger.error(f"Erro ao decodificar JWT: {e}")
        raise credentials_exception
    
    user = db.query(ProfileModel).filter(ProfileModel.email == token_data.email).first()
    if user is None:
        logger.warning(f"Usuário não encontrado para email: {token_data.email}")
        raise credentials_exception
        
    return user

async def get_admin_user(
    current_user: ProfileModel = Depends(get_current_user)
) -> ProfileModel:
    if current_user.tipo_usuario != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Requer privilégios de administrador."
        )
    return current_user
