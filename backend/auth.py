from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
from src.core.db_client import get_database_client
import os
import uuid

# 🔧 Carrega variáveis de ambiente do arquivo .env
load_dotenv()

# 🔐 Configurações de segurança
SECRET_KEY: str = os.getenv("JWT_SECRET_KEY")
ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRES_IN", "3600")) // 60

if not SECRET_KEY:
    raise RuntimeError("❌ JWT_SECRET não definida nas variáveis de ambiente.")

# 🛡️ Autenticação Bearer OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# 🔑 Criptografia de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------------------
# 🔒 Funções de segurança
# ---------------------------

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(user_data: dict, expires_delta: timedelta = None) -> str:
    """
    Cria um token JWT com campos importantes do usuário.
    Espera: { "sub": email, "id": user_id, "is_admin": bool }
    """
    to_encode = user_data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )

# ---------------------------
# 👤 Autenticação e autorização
# ---------------------------

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Retorna os dados do usuário autenticado via token:
    { email, id, is_admin }
    """
    payload = decode_token(token)
    email = payload.get("sub")
    user_id = payload.get("id")
    is_admin = payload.get("is_admin", False)

    if not email or not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token sem informações suficientes"
        )

    return {
        "email": email,
        "id": user_id,
        "is_admin": is_admin
    }

def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Garante que o usuário autenticado seja admin.
    """
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Somente administradores têm acesso"
        )
    return current_user

# ---------------------------
# 📝 Registro de histórico
# ---------------------------

def registrar_alteracao(email_cliente: str, tipo: str, detalhe: str, autor: str) -> None:
    if not all([email_cliente, tipo, detalhe, autor]):
        print("⚠️ Dados insuficientes para registrar histórico.")
        return
    try:
        # TODO: Implementar persistência
        print(f"📝 Histórico: {tipo} - {detalhe} por {autor} para {email_cliente}")
    except Exception as e:
        print("❌ Erro ao registrar histórico:", str(e))
