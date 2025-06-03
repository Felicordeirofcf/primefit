from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from src.core.supabase_client import supabase
from src.api.endpoints.auth import get_current_user
from src.schemas.models import AvaliacaoCreate, AvaliacaoResponse

router = APIRouter()

@router.get("/", response_model=List[AvaliacaoResponse])
async def get_my_assessments(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Obtém as avaliações do usuário autenticado"""
    try:
        query = supabase.table("avaliacoes").select("*").eq("usuario_id", current_user["id"])
        
        # Filtro opcional por status
        if status_filter:
            query = query.eq("status", status_filter)
        
        # Ordena por data de criação (mais recente primeiro)
        query = query.order("data_criacao", desc=True)
        
        # Aplica paginação
        response = query.range(skip, skip + limit).execute()
        
        if not response.data:
            return []
        
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar avaliações: {str(e)}"
        )

@router.post("/", response_model=AvaliacaoResponse)
async def create_assessment(
    assessment_data: AvaliacaoCreate,
    current_user: dict = Depends(get_current_user)
):
    """Cria uma nova avaliação para o usuário autenticado"""
    try:
        # Prepara dados para inserção
        assessment_dict = assessment_data.dict()
        assessment_dict["usuario_id"] = current_user["id"]
        
        # Insere avaliação no Supabase
        response = supabase.table("avaliacoes").insert(assessment_dict).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar avaliação"
            )
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar avaliação: {str(e)}"
        )

@router.get("/{assessment_id}", response_model=AvaliacaoResponse)
async def get_assessment(
    assessment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Obtém uma avaliação específica"""
    try:
        response = supabase.table("avaliacoes").select("*").eq("id", assessment_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )
        
        assessment = response.data[0]
        
        # Verifica se o usuário tem permissão para ver esta avaliação
        if (assessment["usuario_id"] != current_user["id"] and 
            assessment.get("avaliador_id") != current_user["id"] and 
            current_user.get("role") != "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para acessar esta avaliação"
            )
        
        return assessment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar avaliação: {str(e)}"
        )

@router.put("/{assessment_id}", response_model=AvaliacaoResponse)
async def update_assessment(
    assessment_id: str,
    assessment_update: AvaliacaoCreate,
    current_user: dict = Depends(get_current_user)
):
    """Atualiza uma avaliação"""
    try:
        # Verifica se a avaliação existe
        response = supabase.table("avaliacoes").select("*").eq("id", assessment_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )
        
        assessment = response.data[0]
        
        # Verifica permissões
        if (assessment["usuario_id"] != current_user["id"] and 
            assessment.get("avaliador_id") != current_user["id"] and 
            current_user.get("role") != "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para atualizar esta avaliação"
            )
        
        # Prepara dados para atualização
        update_data = assessment_update.dict(exclude_unset=True)
        
        # Atualiza avaliação no Supabase
        response = supabase.table("avaliacoes").update(update_data).eq("id", assessment_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao atualizar avaliação"
            )
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar avaliação: {str(e)}"
        )

@router.put("/{assessment_id}/status")
async def update_assessment_status(
    assessment_id: str,
    new_status: str,
    current_user: dict = Depends(get_current_user)
):
    """Atualiza o status de uma avaliação (apenas para avaliadores e admins)"""
    try:
        # Verifica se a avaliação existe
        response = supabase.table("avaliacoes").select("*").eq("id", assessment_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )
        
        assessment = response.data[0]
        
        # Verifica permissões (apenas avaliador ou admin)
        if (assessment.get("avaliador_id") != current_user["id"] and 
            current_user.get("role") != "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para atualizar o status desta avaliação"
            )
        
        # Valida o novo status
        valid_statuses = ["pendente", "em_andamento", "concluida", "cancelada"]
        if new_status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Status inválido. Valores aceitos: {', '.join(valid_statuses)}"
            )
        
        # Atualiza status
        update_data = {"status": new_status}
        response = supabase.table("avaliacoes").update(update_data).eq("id", assessment_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao atualizar status da avaliação"
            )
        
        return {"message": "Status atualizado com sucesso", "new_status": new_status}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar status: {str(e)}"
        )

@router.get("/admin/all", response_model=List[AvaliacaoResponse])
async def get_all_assessments(
    skip: int = 0,
    limit: int = 100,
    usuario_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Obtém todas as avaliações (apenas para admins)"""
    # Verifica se o usuário tem permissão de administrador
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar esta funcionalidade"
        )
    
    try:
        query = supabase.table("avaliacoes").select("*")
        
        # Filtros opcionais
        if usuario_id:
            query = query.eq("usuario_id", usuario_id)
        if status_filter:
            query = query.eq("status", status_filter)
        
        # Ordena por data de criação (mais recente primeiro)
        query = query.order("data_criacao", desc=True)
        
        # Aplica paginação
        response = query.range(skip, skip + limit).execute()
        
        if not response.data:
            return []
        
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar avaliações: {str(e)}"
        )

@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assessment(
    assessment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Exclui uma avaliação (apenas para admins)"""
    # Verifica se o usuário tem permissão de administrador
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para excluir avaliações"
        )
    
    try:
        # Verifica se a avaliação existe
        response = supabase.table("avaliacoes").select("*").eq("id", assessment_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )
        
        # Exclui avaliação do Supabase
        supabase.table("avaliacoes").delete().eq("id", assessment_id).execute()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir avaliação: {str(e)}"
        )

