from fastapi import APIRouter, Depends, HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
import uuid
import logging

from src.core.database import get_db
from src.core.auth_utils import verify_password, get_password_hash, create_access_token, decode_access_token
from src.schemas.user import UserCreate, UsuarioResponse

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Configuração do OAuth2
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/token",
    scheme_name="OAuth2PasswordBearer"
)

# Função para autenticar usuário
def authenticate_user(db: Session, email: str, password: str):
    try:
        # Busca usuário pelo email
        user = db.query(Usuario).filter(Usuario.email == email).first()
        
        if not user:
            logger.warning(f"Tentativa de login com email não cadastrado: {email}")
            return False
        
        # Verifica se a senha está correta - usando apenas senha_hash
        if not hasattr(user, "senha_hash") or not user.senha_hash:
            logger.error(f"Usuário {email} não tem hash de senha armazenado")
            return False
        
        if not verify_password(password, user.senha_hash):
            logger.warning(f"Senha incorreta para usuário: {email}")
            return False
        
        return user
    except Exception as e:
        logger.error(f"Erro ao autenticar usuário: {str(e)}", exc_info=True)
        return False

# Função para obter usuário atual a partir do token
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        logger.info("Verificando token de autenticação")
        
        # Decodifica o token
        payload = decode_access_token(token)
        if payload is None:
            logger.warning("Token inválido ou expirado")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido ou expirado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Extrai o ID do usuário do token
        user_id = payload.get("sub")
        if user_id is None:
            logger.warning("Token sem ID de usuário")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Busca o usuário no banco de dados
        user = db.query(Usuario).filter(Usuario.id == user_id).first()
        if user is None:
            logger.warning(f"Usuário não encontrado para ID: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário não encontrado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Atualiza último login
        user.updated_at = datetime.now()
        db.commit()
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter usuário atual: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Erro ao verificar credenciais",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Função para obter usuário admin
async def get_admin_user(current_user: Usuario = Depends(get_current_user)):
    try:
        # Verifica se o usuário é admin
        is_admin = getattr(current_user, "is_admin", False) or getattr(current_user, "tipo_usuario", "") == "admin"
        
        if not is_admin:
            logger.warning(f"Tentativa de acesso admin por usuário não-admin: {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado. Requer privilégios de administrador."
            )
        
        return current_user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao verificar permissões de admin: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao verificar permissões"
        )

# Rota para login e obtenção de token
@router.post("/token", summary="Login para obter token de acesso")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Tentativa de login para usuário: {form_data.username}")
        
        # Autentica o usuário
        user = authenticate_user(db, form_data.username, form_data.password)
        if not user:
            logger.warning(f"Falha na autenticação para: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Cria o token de acesso
        access_token_expires = timedelta(minutes=60 * 24 * 7)  # 7 dias
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=access_token_expires
        )
        
        logger.info(f"Login bem-sucedido para: {form_data.username}")
        
        # Retorna o token
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no processo de login: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro no processo de login"
        )

# Rota para registro de novos usuários
@router.post("/register", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Tentativa de registro para email: {user_data.email}")
        
        # Verifica se o email já está em uso
        existing_user = db.query(Usuario).filter(Usuario.email == user_data.email).first()
        if existing_user:
            logger.warning(f"Tentativa de registro com email já existente: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já cadastrado"
            )
        
        # Cria um novo usuário
        hashed_password = get_password_hash(user_data.senha)
        
        new_user = Usuario(
            id=str(uuid.uuid4()),
            nome=user_data.nome,
            email=user_data.email,
            senha_hash=hashed_password,
            tipo_usuario=user_data.tipo_usuario,
            role=user_data.tipo_usuario,
            is_admin=user_data.tipo_usuario == "admin",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            endereco=user_data.endereco,
            cidade=user_data.cidade,
            cep=user_data.cep,
            telefone=user_data.telefone,
            whatsapp=user_data.whatsapp
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"Usuário registrado com sucesso: {user_data.email}")
        
        # Retorna o usuário criado
        return UsuarioResponse(**new_user.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no registro de usuário: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro no registro: {str(e)}"
        )
