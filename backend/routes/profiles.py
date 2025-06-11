from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func

from src.core.database import get_db
from src.api.endpoints.auth import get_current_user, get_admin_user
from src.schemas.models import Profile as ProfileModel, PerfilResponse as ProfileResponse
from src.schemas.user import ProfileUpdate

router = APIRouter()

# ----------------------------
# Obter perfil do usuário atual
# ----------------------------
@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(ProfileModel).filter(ProfileModel.id == current_user["id"]).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil não encontrado"
        )
    
    return profile

# ----------------------------
# Atualizar perfil do usuário atual
# ----------------------------
@router.put("/me", response_model=ProfileResponse)
async def update_my_profile(
    profile_data: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(ProfileModel).filter(ProfileModel.id == current_user["id"]).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil não encontrado"
        )

    for key, value in profile_data.dict(exclude_unset=True).items():
        setattr(profile, key, value)
    
    profile.ultimo_login = func.now()
    
    db.commit()
    db.refresh(profile)
    
    return profile

# ----------------------------
# Obter perfil por ID (com permissão)
# ----------------------------
@router.get("/{user_id}", response_model=ProfileResponse)
async def get_profile_by_id(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["id"] != user_id and current_user.get("role") != "admin":
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
    
    return profile

# ----------------------------
# Listar todos os perfis (somente admin)
# ----------------------------
@router.get("/", response_model=List[ProfileResponse])
async def get_all_profiles(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    profiles = db.query(ProfileModel)\
        .order_by(ProfileModel.criado_em.desc())\
        .offset(skip).limit(limit).all()
    
    return profiles or []
