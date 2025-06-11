"""
Utilitários de autenticação para o backend
"""
import os
from jose import jwt, JWTError
from datetime import datetime, timedelta
from passlib.context import CryptContext
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# Configurações de segurança
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "seu_segredo_super_secreto_mude_em_producao")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 dias

# Contexto para hash de senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """
    Verifica se a senha em texto plano corresponde ao hash armazenado.
    
    Args:
        plain_password (str): Senha em texto plano
        hashed_password (str): Hash da senha armazenada
        
    Returns:
        bool: True se a senha corresponder ao hash
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """
    Gera um hash seguro para a senha.
    
    Args:
        password (str): Senha em texto plano
        
    Returns:
        str: Hash da senha
    """
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    """
    Cria um token JWT de acesso.
    
    Args:
        data (dict): Dados a serem codificados no token
        expires_delta (timedelta, optional): Tempo de expiração do token
        
    Returns:
        str: Token JWT codificado
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    """
    Decodifica e valida um token JWT.
    
    Args:
        token (str): Token JWT a ser decodificado
        
    Returns:
        dict: Dados decodificados do token ou None se inválido
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

