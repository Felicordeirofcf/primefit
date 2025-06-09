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
SECRET_KEY: str = os.getenv("JWT_SECRET")
ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRES_IN", "3600")) // 60

if not SECRET_KEY:
    raise RuntimeError("❌ JWT_SECRET não definida nas variáveis de ambiente.")

# 🛡️ Autenticação Bearer OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# 🔑 Criptografia de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------------------
# 🔒 Funções de segurança
# ---------------------------

def hash_password(password: str) -> str:
    """Gera hash seguro para uma senha."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compara senha digitada com o hash salvo."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """Cria JWT com tempo de expiração."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    """Valida e decodifica token JWT."""
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

def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    """Retorna o e-mail do usuário autenticado pelo token."""
    payload = decode_token(token)
    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado no token"
        )
    return email

def require_admin(user_email: str = Depends(get_current_user)) -> str:
    """Valida se o usuário autenticado é o administrador."""
    try:
        db_client = get_database_client()
        user = db_client.get_user_by_email(user_email)
        db_client.close()
        
        if not user or not user.get("is_admin", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Somente administradores têm acesso"
            )
        return user_email
    except HTTPException:
        raise
    except Exception as e:
        print("❌ Erro ao verificar admin:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno na verificação de permissões"
        )

# ---------------------------
# 📝 Registro de histórico
# ---------------------------

def registrar_alteracao(email_cliente: str, tipo: str, detalhe: str, autor: str) -> None:
    """Registra alterações realizadas no perfil do cliente."""
    if not all([email_cliente, tipo, detalhe, autor]):
        print("⚠️ Dados insuficientes para registrar histórico.")
        return

    try:
        # TODO: Implementar tabela de histórico se necessário
        print(f"📝 Histórico: {tipo} - {detalhe} por {autor} para {email_cliente}")
    except Exception as e:
        print("❌ Erro ao registrar histórico:", str(e))
