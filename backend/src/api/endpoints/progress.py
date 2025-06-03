from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import date

from src.core.supabase_client import supabase
from src.api.endpoints.auth import get_current_user
from src.schemas.models import ProgressoCreate, ProgressoResponse

router = APIRouter()

@router.get("/", response_model=List[ProgressoResponse])
async def get_my_progress(
    skip: int = 0,
    limit: int = 100,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    current_user: dict = Depends(get_current_user)
):
    """Obtém o histórico de progresso do usuário autenticado"""
    try:
        query = supabase.table("progresso").select("*").eq("usuario_id", current_user["id"])
        
        # Filtros opcionais por data
        if data_inicio:
            query = query.gte("data_medicao", data_inicio.isoformat())
        if data_fim:
            query = query.lte("data_medicao", data_fim.isoformat())
        
        # Ordena por data de medição (mais recente primeiro)
        query = query.order("data_medicao", desc=True)
        
        # Aplica paginação
        response = query.range(skip, skip + limit).execute()
        
        if not response.data:
            return []
        
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar progresso: {str(e)}"
        )

@router.post("/", response_model=ProgressoResponse)
async def create_progress_entry(
    progress_data: ProgressoCreate,
    current_user: dict = Depends(get_current_user)
):
    """Cria uma nova entrada de progresso para o usuário autenticado"""
    try:
        # Prepara dados para inserção
        progress_dict = progress_data.dict()
        progress_dict["usuario_id"] = current_user["id"]
        
        # Insere progresso no Supabase
        response = supabase.table("progresso").insert(progress_dict).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar entrada de progresso"
            )
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar progresso: {str(e)}"
        )

@router.get("/{progress_id}", response_model=ProgressoResponse)
async def get_progress_entry(
    progress_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Obtém uma entrada específica de progresso"""
    try:
        response = supabase.table("progresso").select("*").eq("id", progress_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrada de progresso não encontrada"
            )
        
        progress_entry = response.data[0]
        
        # Verifica se o usuário tem permissão para ver esta entrada
        if progress_entry["usuario_id"] != current_user["id"] and current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para acessar esta entrada de progresso"
            )
        
        return progress_entry
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar entrada de progresso: {str(e)}"
        )

@router.put("/{progress_id}", response_model=ProgressoResponse)
async def update_progress_entry(
    progress_id: str,
    progress_update: ProgressoCreate,
    current_user: dict = Depends(get_current_user)
):
    """Atualiza uma entrada de progresso"""
    try:
        # Verifica se a entrada existe e pertence ao usuário
        response = supabase.table("progresso").select("*").eq("id", progress_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrada de progresso não encontrada"
            )
        
        progress_entry = response.data[0]
        
        if progress_entry["usuario_id"] != current_user["id"] and current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para atualizar esta entrada de progresso"
            )
        
        # Prepara dados para atualização
        update_data = progress_update.dict(exclude_unset=True)
        
        # Atualiza entrada no Supabase
        response = supabase.table("progresso").update(update_data).eq("id", progress_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao atualizar entrada de progresso"
            )
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar progresso: {str(e)}"
        )

@router.delete("/{progress_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_progress_entry(
    progress_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Exclui uma entrada de progresso"""
    try:
        # Verifica se a entrada existe e pertence ao usuário
        response = supabase.table("progresso").select("*").eq("id", progress_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrada de progresso não encontrada"
            )
        
        progress_entry = response.data[0]
        
        if progress_entry["usuario_id"] != current_user["id"] and current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para excluir esta entrada de progresso"
            )
        
        # Exclui entrada do Supabase
        supabase.table("progresso").delete().eq("id", progress_id).execute()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir progresso: {str(e)}"
        )

@router.get("/stats/summary")
async def get_progress_summary(current_user: dict = Depends(get_current_user)):
    """Obtém um resumo estatístico do progresso do usuário"""
    try:
        # Busca todas as entradas de progresso do usuário
        response = supabase.table("progresso").select("*").eq("usuario_id", current_user["id"]).order("data_medicao", desc=False).execute()
        
        if not response.data or len(response.data) == 0:
            return {
                "total_medicoes": 0,
                "primeira_medicao": None,
                "ultima_medicao": None,
                "evolucao_peso": None,
                "evolucao_gordura": None
            }
        
        medicoes = response.data
        primeira = medicoes[0]
        ultima = medicoes[-1]
        
        # Calcula evoluções
        evolucao_peso = None
        if primeira.get("peso") and ultima.get("peso"):
            evolucao_peso = ultima["peso"] - primeira["peso"]
        
        evolucao_gordura = None
        if primeira.get("percentual_gordura") and ultima.get("percentual_gordura"):
            evolucao_gordura = ultima["percentual_gordura"] - primeira["percentual_gordura"]
        
        return {
            "total_medicoes": len(medicoes),
            "primeira_medicao": primeira["data_medicao"],
            "ultima_medicao": ultima["data_medicao"],
            "evolucao_peso": evolucao_peso,
            "evolucao_gordura": evolucao_gordura,
            "peso_atual": ultima.get("peso"),
            "gordura_atual": ultima.get("percentual_gordura")
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao calcular resumo de progresso: {str(e)}"
        )

