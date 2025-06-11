from datetime import timedelta, datetime
from typing import Optional

import os
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from src.core.auth_utils import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    decode_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from src.core.database import get_db
from src.schemas.models import PerfilResponse as UserResponse, CadastroSimples as UserCreate, Profile
from src.schemas.user import Token

# Variáveis de ambiente para JWT
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "chave_padrao")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

# ----------------------------
# Registro de novo usuário
# ----------------------------
@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(Profile).filter(Profile.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já está em uso"
        )
    
    hashed_password = get_password_hash(user_data.senha)

    new_profile = Profile(
        nome=user_data.nome,
        email=user_data.email,
        password_hash=hashed_password,
        role="client",
        criado_em=datetime.utcnow(),
        ultimo_login=datetime.utcnow()
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    
    return new_profile

# ----------------------------
# Login com retorno de token
# ----------------------------
@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    user = db.query(Profile).filter(Profile.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# ----------------------------
# Obter usuário autenticado via token
# ----------------------------
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    email = payload.get("sub")
    user_id = payload.get("user_id")
    
    if not email or not user_id:
        raise credentials_exception
    
    user = db.query(Profile).filter(Profile.id == user_id, Profile.email == email).first()
    if not user:
        raise credentials_exception
    
    return user

# ----------------------------
# Verifica se o usuário está ativo
# ----------------------------
async def get_current_active_user(current_user: Profile = Depends(get_current_user)):
    return current_user

# ----------------------------
# Verifica se o usuário é admin
# ----------------------------
async def get_admin_user(current_user: Profile = Depends(get_current_user)):
    if current_user.role != "admin" and current_user.email != "felpcordeirofcf@gmail.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permissão negada. Acesso restrito a administradores."
        )
    return current_user

# ----------------------------
# Autenticação WebSocket via token na query
# ----------------------------
async def get_current_websocket_user(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token ausente")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload  # ou: return {"email": payload["sub"], "user_id": payload["user_id"]}
    except JWTError:
        await websocket.close(code=1008)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token inválido")
