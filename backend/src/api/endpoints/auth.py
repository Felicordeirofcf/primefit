from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import Optional

from src.core.supabase_client import supabase
from src.schemas.user import UserCreate, UserResponse
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# Configurações de segurança
SECRET_KEY = os.getenv("SECRET_KEY", "chave_secreta_temporaria_deve_ser_alterada_em_producao")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Configuração de criptografia de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

router = APIRouter()

# Modelos para autenticação
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    user_role: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None
    role: Optional[str] = None

# Funções de autenticação
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def authenticate_user(email: str, password: str):
    try:
        # Busca usuário pelo email
        response = supabase.table("users").select("*").eq("email", email).execute()
        
        if not response.data or len(response.data) == 0:
            return False
        
        user = response.data[0]
        
        if not verify_password(password, user["password"]):
            return False
        
        return user
    except Exception as e:
        print(f"Erro ao autenticar usuário: {e}")
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        role: str = payload.get("role")
        
        if email is None or user_id is None:
            raise credentials_exception
        
        token_data = TokenData(email=email, user_id=user_id, role=role)
    except JWTError:
        raise credentials_exception
    
    try:
        response = supabase.table("users").select("*").eq("id", token_data.user_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise credentials_exception
        
        user = response.data[0]
        return user
    except Exception:
        raise credentials_exception

# Rotas de autenticação
@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    try:
        # Verifica se o email já existe
        response = supabase.table("users").select("*").eq("email", user.email).execute()
        
        if response.data and len(response.data) > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já cadastrado"
            )
        
        # Cria hash da senha
        hashed_password = get_password_hash(user.password)
        
        # Prepara dados para inserção
        user_data = {
            "email": user.email,
            "password": hashed_password,
            "full_name": user.full_name, # Corrigido de name para full_name
            "role": "client",  # Por padrão, novos usuários são clientes
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Insere usuário no Supabase
        response = supabase.table("users").insert(user_data).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar usuário"
            )
        
        created_user = response.data[0]
        
        # Remove senha do retorno
        created_user.pop("password", None)
        
        return created_user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao registrar usuário: {str(e)}"
        )

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "user_id": user["id"], "role": user["role"]},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user["id"],
        "user_role": user["role"]
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user = Depends(get_current_user)):
    # Remove senha do retorno
    user_data = dict(current_user)
    user_data.pop("password", None)
    return user_data
