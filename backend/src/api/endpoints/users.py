from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from src.core.supabase_client import supabase
from src.api.endpoints.auth import get_current_user
from src.schemas.user import UserResponse, UserUpdate

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = 0, 
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
):
    # Verifica se o usuário tem permissão de administrador
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar esta funcionalidade"
        )
    
    try:
        response = supabase.table("users").select("*").range(skip, skip + limit).execute()
        
        if not response.data:
            return []
        
        # Remove senhas do retorno
        users = []
        for user in response.data:
            user_data = dict(user)
            user_data.pop("password", None)
            users.append(user_data)
        
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar usuários: {str(e)}"
        )

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Verifica se o usuário está buscando seu próprio perfil ou é um admin
    if current_user["id"] != user_id and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar este perfil"
        )
    
    try:
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        # Remove senha do retorno
        user_data = dict(response.data[0])
        user_data.pop("password", None)
        
        return user_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar usuário: {str(e)}"
        )

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    # Verifica se o usuário está atualizando seu próprio perfil ou é um admin
    if current_user["id"] != user_id and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para atualizar este perfil"
        )
    
    try:
        # Verifica se o usuário existe
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        # Prepara dados para atualização
        update_data = user_update.dict(exclude_unset=True)
        
        # Atualiza usuário no Supabase
        response = supabase.table("users").update(update_data).eq("id", user_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao atualizar usuário"
            )
        
        # Remove senha do retorno
        user_data = dict(response.data[0])
        user_data.pop("password", None)
        
        return user_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar usuário: {str(e)}"
        )

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Apenas administradores podem excluir usuários
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para excluir usuários"
        )
    
    try:
        # Verifica se o usuário existe
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        # Exclui usuário do Supabase
        supabase.table("users").delete().eq("id", user_id).execute()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir usuário: {str(e)}"
        )
