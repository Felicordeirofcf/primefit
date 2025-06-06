"""
Endpoints de autenticação
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
from typing import Optional

from src.core.auth_utils import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    decode_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from src.core.db_client import execute_query
from src.schemas.user import UserCreate, UserLogin, Token, UserResponse

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    """
    Registra um novo usuário.
    """
    # Verificar se o email já existe
    existing_user = execute_query(
        "SELECT * FROM users WHERE email = %s",
        (user_data.email,)
    )
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já está em uso"
        )
    
    # Hash da senha
    hashed_password = get_password_hash(user_data.password)
    
    # Inserir o novo usuário
    new_user = execute_query(
        """
        INSERT INTO users (email, password_hash, role)
        VALUES (%s, %s, %s)
        RETURNING id, email, role, created_at
        """,
        (user_data.email, hashed_password, "user")
    )
    
    if not new_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Falha ao criar usuário"
        )
    
    # Criar perfil vazio para o usuário
    execute_query(
        """
        INSERT INTO profiles (user_id, email)
        VALUES (%s, %s)
        """,
        (new_user[0]['id'], user_data.email)
    )
    
    return new_user[0]

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Autentica um usuário e retorna um token de acesso.
    """
    # Buscar usuário pelo email
    user_result = execute_query(
        "SELECT * FROM users WHERE email = %s",
        (form_data.username,)  # OAuth2PasswordRequestForm usa 'username' para o email
    )
    
    if not user_result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = user_result[0]
    
    # Verificar senha
    if not verify_password(form_data.password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Criar token de acesso
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['email'], "user_id": user['id'], "role": user['role']},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Obtém o usuário atual a partir do token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    email: str = payload.get("sub")
    user_id: str = payload.get("user_id")
    
    if email is None or user_id is None:
        raise credentials_exception
    
    user_result = execute_query(
        "SELECT * FROM users WHERE id = %s AND email = %s",
        (user_id, email)
    )
    
    if not user_result:
        raise credentials_exception
    
    return user_result[0]

async def get_current_active_user(current_user = Depends(get_current_user)):
    """
    Verifica se o usuário atual está ativo.
    """
    if current_user.get('is_active') is False:
        raise HTTPException(status_code=400, detail="Usuário inativo")
    return current_user

async def get_admin_user(current_user = Depends(get_current_user)):
    """
    Verifica se o usuário atual é um administrador.
    """
    if current_user.get('role') != "admin" and current_user.get('email') != "felpcordeirofcf@gmail.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permissão negada. Acesso restrito a administradores."
        )
    return current_user

