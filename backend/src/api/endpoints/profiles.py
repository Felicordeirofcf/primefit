from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from src.core.supabase_client import supabase
from src.api.endpoints.auth import get_current_user
from src.schemas.models import PerfilCreate, PerfilUpdate, PerfilResponse

router = APIRouter()

@router.get("/me", response_model=PerfilResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Obtém o perfil do usuário autenticado"""
    try:
        response = supabase.table("profiles").select("*").eq("id", current_user["id"]).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Perfil não encontrado"
            )
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar perfil: {str(e)}"
        )

@router.put("/me", response_model=PerfilResponse)
async def update_my_profile(
    profile_update: PerfilUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Atualiza o perfil do usuário autenticado"""
    try:
        # Verifica se o perfil existe
        response = supabase.table("profiles").select("*").eq("id", current_user["id"]).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Perfil não encontrado"
            )
        
        # Prepara dados para atualização
        update_data = profile_update.dict(exclude_unset=True)
        
        # Atualiza perfil no Supabase
        response = supabase.table("profiles").update(update_data).eq("id", current_user["id"]).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao atualizar perfil"
            )
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar perfil: {str(e)}"
        )

@router.get("/{user_id}", response_model=PerfilResponse)
async def get_profile(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Obtém o perfil de um usuário específico (apenas admins ou próprio usuário)"""
    # Verifica se o usuário está buscando seu próprio perfil ou é um admin
    if current_user["id"] != user_id and current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar este perfil"
        )
    
    try:
        response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Perfil não encontrado"
            )
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar perfil: {str(e)}"
        )

@router.get("/", response_model=List[PerfilResponse])
async def get_all_profiles(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
):
    """Lista todos os perfis (apenas para admins)"""
    # Verifica se o usuário tem permissão de administrador
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar esta funcionalidade"
        )
    
    try:
        response = supabase.table("profiles").select("*").range(skip, skip + limit).execute()
        
        if not response.data:
            return []
        
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar perfis: {str(e)}"
        )

@router.post("/", response_model=PerfilResponse)
async def create_profile(
    profile_data: PerfilCreate,
    current_user: dict = Depends(get_current_user)
):
    """Cria um perfil para o usuário autenticado"""
    try:
        # Verifica se já existe um perfil para este usuário
        response = supabase.table("profiles").select("*").eq("id", current_user["id"]).execute()
        
        if response.data and len(response.data) > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Perfil já existe para este usuário"
            )
        
        # Prepara dados para inserção
        profile_dict = profile_data.dict()
        profile_dict["id"] = current_user["id"]
        profile_dict["email"] = current_user["email"]
        
        # Insere perfil no Supabase
        response = supabase.table("profiles").insert(profile_dict).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar perfil"
            )
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar perfil: {str(e)}"
        )

