from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
import logging
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

from src.core.database import get_db
from routes.auth import get_current_user, get_admin_user
from src.schemas.models import Usuario as UsuarioModel  # Ajustado para Usuario em vez de Profile
from src.schemas.user import UsuarioUpdate  # Ajustado para UsuarioUpdate

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# ---------------------------
# 📦 MODELOS Pydantic para serialização (compatível com Pydantic V2)
# ---------------------------

class UsuarioResponse(BaseModel):
    id: str
    nome: str
    email: EmailStr
    tipo_usuario: str
    created_at: datetime  # Ajustado para created_at em vez de criado_em
    updated_at: Optional[datetime] = None  # Ajustado para updated_at em vez de ultimo_login
    endereco: Optional[str] = None
    cidade: Optional[str] = None
    cep: Optional[str] = None
    telefone: Optional[str] = None
    whatsapp: Optional[str] = None
    is_admin: Optional[bool] = None
    role: Optional[str] = None
    
    # Compatível com Pydantic V2
    model_config = {"from_attributes": True}

# ----------------------------
# Obter perfil do usuário atual
# ----------------------------
@router.get("/me", response_model=UsuarioResponse)
async def get_my_profile(
    current_user: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Log detalhado para depuração
        logger.info(f"Obtendo perfil para usuário: {current_user.id}")
        
        # Criando um dicionário explícito com todos os campos necessários
        usuario_dict = {
            "id": str(current_user.id),
            "nome": current_user.nome,
            "email": current_user.email,
            "tipo_usuario": current_user.tipo_usuario,
            "created_at": current_user.created_at,
            "updated_at": current_user.updated_at,
            "endereco": getattr(current_user, "endereco", None),
            "cidade": getattr(current_user, "cidade", None),
            "cep": getattr(current_user, "cep", None),
            "telefone": getattr(current_user, "telefone", None),
            "whatsapp": getattr(current_user, "whatsapp", None),
            "is_admin": getattr(current_user, "is_admin", False),
            "role": getattr(current_user, "role", current_user.tipo_usuario)
        }
        
        # Log do dicionário para depuração
        logger.info(f"Dados do usuário: {usuario_dict}")
        
        return usuario_dict
    except Exception as e:
        logger.error(f"Erro ao obter perfil do usuário: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter perfil: {str(e)}"
        )

# ----------------------------
# Atualizar perfil do usuário atual
# ----------------------------
@router.put("/me", response_model=UsuarioResponse)
async def update_my_profile(
    usuario_data: UsuarioUpdate,
    current_user: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        usuario = db.query(UsuarioModel).filter(UsuarioModel.id == current_user.id).first()
        
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )

        # Atualiza apenas os campos fornecidos
        update_data = usuario_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(usuario, key, value)
        
        usuario.updated_at = func.now()  # Atualiza o campo updated_at
        
        db.commit()
        db.refresh(usuario)
        
        # Retorna um dicionário explícito em vez do objeto SQLAlchemy
        return {
            "id": str(usuario.id),
            "nome": usuario.nome,
            "email": usuario.email,
            "tipo_usuario": usuario.tipo_usuario,
            "created_at": usuario.created_at,
            "updated_at": usuario.updated_at,
            "endereco": getattr(usuario, "endereco", None),
            "cidade": getattr(usuario, "cidade", None),
            "cep": getattr(usuario, "cep", None),
            "telefone": getattr(usuario, "telefone", None),
            "whatsapp": getattr(usuario, "whatsapp", None),
            "is_admin": getattr(usuario, "is_admin", False),
            "role": getattr(usuario, "role", usuario.tipo_usuario)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar perfil: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar perfil: {str(e)}"
        )

# ----------------------------
# Obter perfil por ID (com permissão)
# ----------------------------
@router.get("/{user_id}", response_model=UsuarioResponse)
async def get_profile_by_id(
    user_id: str,
    current_user: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Verificação de permissão mais flexível para testes
        is_admin = getattr(current_user, "is_admin", False) or getattr(current_user, "tipo_usuario", "") == "admin"
        
        if current_user.id != user_id and not is_admin:
            logger.warning(f"Acesso negado: usuário {current_user.id} tentando acessar perfil {user_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado"
            )
        
        usuario = db.query(UsuarioModel).filter(UsuarioModel.id == user_id).first()
        
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        # Retorna um dicionário explícito em vez do objeto SQLAlchemy
        return {
            "id": str(usuario.id),
            "nome": usuario.nome,
            "email": usuario.email,
            "tipo_usuario": usuario.tipo_usuario,
            "created_at": usuario.created_at,
            "updated_at": usuario.updated_at,
            "endereco": getattr(usuario, "endereco", None),
            "cidade": getattr(usuario, "cidade", None),
            "cep": getattr(usuario, "cep", None),
            "telefone": getattr(usuario, "telefone", None),
            "whatsapp": getattr(usuario, "whatsapp", None),
            "is_admin": getattr(usuario, "is_admin", False),
            "role": getattr(usuario, "role", usuario.tipo_usuario)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter perfil por ID: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter perfil: {str(e)}"
        )

# ----------------------------
# Listar todos os perfis com filtros dinâmicos (somente admin)
# ----------------------------
@router.get("/", response_model=List[UsuarioResponse])
async def get_all_profiles(
    # Query parameters para filtros dinâmicos
    email: Optional[str] = None,
    nome: Optional[str] = None,
    tipo_usuario: Optional[str] = None,
    cidade: Optional[str] = None,
    telefone: Optional[str] = None,
    whatsapp: Optional[str] = None,
    role: Optional[str] = None,
    # Parâmetros de paginação
    skip: int = 0,
    limit: int = 100,
    current_user: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Verificação de permissão mais flexível para testes
        is_admin = getattr(current_user, "is_admin", False) or getattr(current_user, "tipo_usuario", "") == "admin"
        
        if not is_admin:
            logger.warning(f"Acesso negado: usuário {current_user.id} não é admin")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado. Requer privilégios de administrador."
            )
        
        # Construção da query base
        query = db.query(UsuarioModel)
        
        # Aplicação de filtros dinâmicos
        if email:
            query = query.filter(UsuarioModel.email == email)
        if nome:
            query = query.filter(UsuarioModel.nome.ilike(f"%{nome}%"))
        if tipo_usuario:
            query = query.filter(UsuarioModel.tipo_usuario == tipo_usuario)
        if cidade:
            query = query.filter(UsuarioModel.cidade.ilike(f"%{cidade}%"))
        if telefone:
            query = query.filter(UsuarioModel.telefone == telefone)
        if whatsapp:
            query = query.filter(UsuarioModel.whatsapp == whatsapp)
        if role:
            # Filtro por role, considerando que pode ser igual ao tipo_usuario
            query = query.filter(
                (UsuarioModel.role == role) | 
                (UsuarioModel.tipo_usuario == role)
            )
        
        # Execução da query com ordenação e paginação
        usuarios = query.order_by(UsuarioModel.created_at.desc())\
            .offset(skip).limit(limit).all()
        
        # Converte cada usuário para um dicionário para evitar problemas de serialização
        result = []
        for usuario in usuarios:
            result.append({
                "id": str(usuario.id),
                "nome": usuario.nome,
                "email": usuario.email,
                "tipo_usuario": usuario.tipo_usuario,
                "created_at": usuario.created_at,
                "updated_at": usuario.updated_at,
                "endereco": getattr(usuario, "endereco", None),
                "cidade": getattr(usuario, "cidade", None),
                "cep": getattr(usuario, "cep", None),
                "telefone": getattr(usuario, "telefone", None),
                "whatsapp": getattr(usuario, "whatsapp", None),
                "is_admin": getattr(usuario, "is_admin", False),
                "role": getattr(usuario, "role", usuario.tipo_usuario)
            })
        
        logger.info(f"Filtros aplicados - email: {email}, nome: {nome}, tipo_usuario: {tipo_usuario}, cidade: {cidade}, telefone: {telefone}, whatsapp: {whatsapp}, role: {role}")
        logger.info(f"Retornando {len(result)} usuários")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao listar usuários: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar usuários: {str(e)}"
        )
