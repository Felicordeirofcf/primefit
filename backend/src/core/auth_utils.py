"""
Utilitários de autenticação para o backend - Versão robusta usando bcrypt diretamente
"""
import os
from datetime import datetime, timedelta
import bcrypt  # Importação direta do bcrypt
from jose import jwt, JWTError
from dotenv import load_dotenv
import logging

# Configuração de logging
logger = logging.getLogger(__name__)

# Carrega variáveis de ambiente do .env
load_dotenv()

# Configurações de segurança
SECRET_KEY = os.getenv("SECRET_KEY", "seu_segredo_super_secreto_mude_em_producao")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24 * 7))  # 7 dias por padrão

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica se a senha em texto plano corresponde ao hash armazenado.
    Usa bcrypt diretamente sem depender do passlib.
    """
    try:
        # Certifica-se de que ambos são bytes
        if isinstance(plain_password, str):
            plain_password = plain_password.encode('utf-8')
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
            
        return bcrypt.checkpw(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Erro ao verificar senha: {str(e)}")
        # Fallback para comparação direta em caso de erro
        return False

def get_password_hash(password: str) -> str:
    """
    Gera um hash seguro para a senha usando bcrypt diretamente.
    """
    try:
        # Certifica-se de que a senha é bytes
        if isinstance(password, str):
            password = password.encode('utf-8')
            
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password, salt)
        return hashed.decode('utf-8')
    except Exception as e:
        logger.error(f"Erro ao gerar hash de senha: {str(e)}")
        raise

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """
    Cria um token JWT com dados do usuário e tempo de expiração.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    
    try:
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    except Exception as e:
        logger.error(f"Erro ao criar token de acesso: {str(e)}")
        raise

def decode_access_token(token: str) -> dict | None:
    """
    Decodifica e valida um token JWT.
    Retorna o payload ou None se inválido/expirado.
    """
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as e:
        logger.error(f"Erro ao decodificar token: {str(e)}")
        return None
