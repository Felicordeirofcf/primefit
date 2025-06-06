"""
Endpoints para gerenciamento de perfis de usuários
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from src.api.endpoints.auth import get_current_user, get_admin_user
from src.core.db_client import execute_query
from src.schemas.user import ProfileResponse, ProfileUpdate

router = APIRouter()

@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(current_user = Depends(get_current_user)):
    """
    Obtém o perfil do usuário atual.
    """
    profile_result = execute_query(
        "SELECT * FROM profiles WHERE user_id = %s",
        (current_user['id'],)
    )
    
    if not profile_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil não encontrado"
        )
    
    return profile_result[0]

@router.put("/me", response_model=ProfileResponse)
async def update_my_profile(profile_data: ProfileUpdate, current_user = Depends(get_current_user)):
    """
    Atualiza o perfil do usuário atual.
    """
    # Verificar se o perfil existe
    profile_result = execute_query(
        "SELECT * FROM profiles WHERE user_id = %s",
        (current_user['id'],)
    )
    
    if not profile_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil não encontrado"
        )
    
    # Construir a consulta de atualização dinamicamente
    update_fields = []
    update_values = []
    
    for field, value in profile_data.dict(exclude_unset=True).items():
        if value is not None:  # Ignorar campos None
            update_fields.append(f"{field} = %s")
            update_values.append(value)
    
    if not update_fields:
        # Nenhum campo para atualizar
        return profile_result[0]
    
    # Adicionar o ID do usuário aos valores
    update_values.append(current_user['id'])
    
    # Executar a atualização
    updated_profile = execute_query(
        f"""
        UPDATE profiles
        SET {", ".join(update_fields)}, updated_at = NOW()
        WHERE user_id = %s
        RETURNING *
        """,
        tuple(update_values)
    )
    
    if not updated_profile:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Falha ao atualizar perfil"
        )
    
    return updated_profile[0]

@router.get("/{user_id}", response_model=ProfileResponse)
async def get_profile_by_id(user_id: str, current_user = Depends(get_current_user)):
    """
    Obtém o perfil de um usuário específico.
    """
    # Verificar se o usuário atual é o proprietário do perfil ou um admin
    if current_user['id'] != user_id and current_user.get('role') != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado"
        )
    
    profile_result = execute_query(
        "SELECT * FROM profiles WHERE user_id = %s",
        (user_id,)
    )
    
    if not profile_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil não encontrado"
        )
    
    return profile_result[0]

@router.get("/", response_model=List[ProfileResponse])
async def get_all_profiles(skip: int = 0, limit: int = 100, current_user = Depends(get_admin_user)):
    """
    Obtém todos os perfis (apenas para administradores).
    """
    profiles = execute_query(
        "SELECT * FROM profiles ORDER BY created_at DESC LIMIT %s OFFSET %s",
        (limit, skip)
    )
    
    return profiles or []

