from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from pydantic import BaseModel, EmailStr
import os
import uuid

from src.core.database import get_db
from src.schemas.models import Profile as ProfileModel, PerfilResponse
from src.core.auth_utils import verify_password, get_password_hash, create_access_token, decode_access_token, ACCESS_TOKEN_EXPIRE_MINUTES # Import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

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
    
    # Usando a constante ACCESS_TOKEN_EXPIRE_MINUTES diretamente de auth_utils
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.tipo_usuario}, expires_delta=access_token_expires
    )
    
    user.ultimo_login = datetime.utcnow()
    db.commit()
    db.refresh(user)

    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> ProfileModel:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    print(f"DEBUG: get_current_user received token: {token[:30]}...") # Log token
    try:
        payload = decode_access_token(token)
        print(f"DEBUG: get_current_user decoded payload: {payload}") # Log payload
        email: str = payload.get("sub")
        if email is None:
            print("DEBUG: Email is None in token payload.")
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError as e:
        print(f"DEBUG: JWTError during token decoding: {e}") # Log JWT error
        raise credentials_exception
    
    user = db.query(ProfileModel).filter(ProfileModel.email == token_data.email).first()
    if user is None:
        print(f"DEBUG: User not found in DB for email: {token_data.email}")
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
