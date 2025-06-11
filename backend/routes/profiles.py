from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import logging
from pydantic import BaseModel, EmailStr
from datetime import datetime

from src.core.database import get_db
from routes.auth import get_current_user, get_admin_user
from src.schemas.models import Profile as ProfileModel
from src.schemas.user import ProfileUpdate

# Configuração de logging
logger = logging.getLogger(__name__)

router = APIRouter()

# ---------------------------
# 📦 MODELOS Pydantic para serialização
# ---------------------------

class ProfileResponse(BaseModel):
    id: str
    nome: str
    email: EmailStr
    tipo_usuario: str
    criado_em: datetime
    ultimo_login: Optional[datetime] = None
    
    class Config:
        orm_mode = True  # Permite converter diretamente de objeto SQLAlchemy
        # Para Pydantic v2, use:
        # model_config = {"from_attributes": True}

# ----------------------------
# Obter perfil do usuário atual
# ----------------------------
@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    current_user: ProfileModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Usando orm_mode para converter automaticamente
        return current_user
    except Exception as e:
        logger.error(f"Erro ao obter perfil do usuário: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter perfil: {str(e)}"
        )

# ----------------------------
# Atualizar perfil do usuário atual
# ----------------------------
@router.put("/me", response_model=ProfileResponse)
async def update_my_profile(
    profile_data: ProfileUpdate,
    current_user: ProfileModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        profile = db.query(ProfileModel).filter(ProfileModel.id == current_user.id).first()
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Perfil não encontrado"
            )

        # Atualiza apenas os campos fornecidos
        update_data = profile_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(profile, key, value)
        
        profile.ultimo_login = func.now()
        
        db.commit()
        db.refresh(profile)
        
        # Retorna o objeto diretamente, orm_mode fará a conversão
        return profile
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
@router.get("/{user_id}", response_model=ProfileResponse)
async def get_profile_by_id(
    user_id: str,
    current_user: ProfileModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        if current_user.id != user_id and current_user.tipo_usuario != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado"
            )
        
        profile = db.query(ProfileModel).filter(ProfileModel.id == user_id).first()
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Perfil não encontrado"
            )
        
        # Retorna o objeto diretamente, orm_mode fará a conversão
        return profile
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter perfil por ID: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter perfil: {str(e)}"
        )

# ----------------------------
# Listar todos os perfis (somente admin)
# ----------------------------
@router.get("/", response_model=List[ProfileResponse])
async def get_all_profiles(
    skip: int = 0,
    limit: int = 100,
    current_user: ProfileModel = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    try:
        profiles = db.query(ProfileModel)\
            .order_by(ProfileModel.criado_em.desc())\
            .offset(skip).limit(limit).all()
        
        # Retorna a lista diretamente, orm_mode fará a conversão de cada item
        return profiles
    except Exception as e:
        logger.error(f"Erro ao listar perfis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar perfis: {str(e)}"
        )
