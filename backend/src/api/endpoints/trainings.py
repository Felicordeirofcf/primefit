from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List, Optional

from src.core.supabase_client import get_supabase_client
supabase = get_supabase_client()
from src.api.endpoints.auth import get_current_user
from src.schemas.models import TreinoCreate, TreinoResponse

router = APIRouter()

@router.get("/", response_model=List[TreinoResponse])
async def get_my_trainings(
    skip: int = 0,
    limit: int = 100,
    apenas_ativos: bool = True,
    current_user: dict = Depends(get_current_user)
):
    """Obtém os treinos do usuário autenticado"""
    try:
        query = supabase.table("treinos_enviados").select("*").eq("cliente_id", current_user["id"])
        
        # Filtro opcional para apenas treinos ativos
        if apenas_ativos:
            query = query.eq("ativo", True)
        
        # Ordena por data de envio (mais recente primeiro)
        query = query.order("enviado_em", desc=True)
        
        # Aplica paginação
        response = query.range(skip, skip + limit).execute()
        
        if not response.data:
            return []
        
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar treinos: {str(e)}"
        )

@router.get("/{training_id}", response_model=TreinoResponse)
async def get_training(
    training_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Obtém um treino específico"""
    try:
        response = supabase.table("treinos_enviados").select("*").eq("id", training_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Treino não encontrado"
            )
        
        training = response.data[0]
        
        # Verifica se o usuário tem permissão para ver este treino
        if training["cliente_id"] != current_user["id"] and current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para acessar este treino"
            )
        
        return training
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar treino: {str(e)}"
        )

@router.post("/", response_model=TreinoResponse)
async def create_training(
    training_data: TreinoCreate,
    current_user: dict = Depends(get_current_user)
):
    """Cria um novo treino (apenas para admins)"""
    # Verifica se o usuário tem permissão de administrador
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para criar treinos"
        )
    
    try:
        # Verifica se o cliente existe
        response = supabase.table("profiles").select("email").eq("id", training_data.cliente_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente não encontrado"
            )
        
        # Prepara dados para inserção
        training_dict = training_data.dict()
        training_dict["cliente_email"] = response.data[0]["email"]
        
        # Insere treino no Supabase
        response = supabase.table("treinos_enviados").insert(training_dict).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar treino"
            )
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar treino: {str(e)}"
        )

@router.put("/{training_id}", response_model=TreinoResponse)
async def update_training(
    training_id: str,
    training_update: TreinoCreate,
    current_user: dict = Depends(get_current_user)
):
    """Atualiza um treino (apenas para admins)"""
    # Verifica se o usuário tem permissão de administrador
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para atualizar treinos"
        )
    
    try:
        # Verifica se o treino existe
        response = supabase.table("treinos_enviados").select("*").eq("id", training_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Treino não encontrado"
            )
        
        # Prepara dados para atualização
        update_data = training_update.dict(exclude_unset=True)
        
        # Atualiza treino no Supabase
        response = supabase.table("treinos_enviados").update(update_data).eq("id", training_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao atualizar treino"
            )
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar treino: {str(e)}"
        )

@router.delete("/{training_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_training(
    training_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Exclui um treino (apenas para admins)"""
    # Verifica se o usuário tem permissão de administrador
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para excluir treinos"
        )
    
    try:
        # Verifica se o treino existe
        response = supabase.table("treinos_enviados").select("*").eq("id", training_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Treino não encontrado"
            )
        
        # Marca treino como inativo ao invés de excluir
        response = supabase.table("treinos_enviados").update({"ativo": False}).eq("id", training_id).execute()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir treino: {str(e)}"
        )

@router.get("/admin/all", response_model=List[TreinoResponse])
async def get_all_trainings(
    skip: int = 0,
    limit: int = 100,
    cliente_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Obtém todos os treinos (apenas para admins)"""
    # Verifica se o usuário tem permissão de administrador
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar esta funcionalidade"
        )
    
    try:
        query = supabase.table("treinos_enviados").select("*")
        
        # Filtro opcional por cliente
        if cliente_id:
            query = query.eq("cliente_id", cliente_id)
        
        # Ordena por data de envio (mais recente primeiro)
        query = query.order("enviado_em", desc=True)
        
        # Aplica paginação
        response = query.range(skip, skip + limit).execute()
        
        if not response.data:
            return []
        
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar treinos: {str(e)}"
        )

