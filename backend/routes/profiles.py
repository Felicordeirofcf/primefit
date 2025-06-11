from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
import logging

from src.core.database import get_db
from routes.auth import get_current_user, get_admin_user
from src.schemas.models import Profile as ProfileModel, PerfilResponse as ProfileResponse
from src.schemas.user import ProfileUpdate

# Configuração de logging
logger = logging.getLogger(__name__)

router = APIRouter()

# ----------------------------
# Obter perfil do usuário atual
# ----------------------------
@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    current_user: ProfileModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Convertemos explicitamente para um dicionário para evitar problemas de serialização
        return {
            "id": current_user.id,
            "nome": current_user.nome,
            "email": current_user.email,
            "tipo_usuario": current_user.tipo_usuario,
            "criado_em": current_user.criado_em,
            "ultimo_login": current_user.ultimo_login
            # Adicione outros campos conforme necessário
        }
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
        
        # Retorna um dicionário explícito em vez do objeto SQLAlchemy
        return {
            "id": profile.id,
            "nome": profile.nome,
            "email": profile.email,
            "tipo_usuario": profile.tipo_usuario,
            "criado_em": profile.criado_em,
            "ultimo_login": profile.ultimo_login
            # Adicione outros campos conforme necessário
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
        
        # Retorna um dicionário explícito em vez do objeto SQLAlchemy
        return {
            "id": profile.id,
            "nome": profile.nome,
            "email": profile.email,
            "tipo_usuario": profile.tipo_usuario,
            "criado_em": profile.criado_em,
            "ultimo_login": profile.ultimo_login
            # Adicione outros campos conforme necessário
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
        
        # Converte cada perfil para um dicionário para evitar problemas de serialização
        result = []
        for profile in profiles:
            result.append({
                "id": profile.id,
                "nome": profile.nome,
                "email": profile.email,
                "tipo_usuario": profile.tipo_usuario,
                "criado_em": profile.criado_em,
                "ultimo_login": profile.ultimo_login
                # Adicione outros campos conforme necessário
            })
        
        return result
    except Exception as e:
        logger.error(f"Erro ao listar perfis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar perfis: {str(e)}"
        )
