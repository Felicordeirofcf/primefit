from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func

from src.core.database import get_db
from routes.auth import get_current_user
from src.schemas.models import Progresso, ProgressoCreate, ProgressoResponse
from src.core.models import Usuario

router = APIRouter()

@router.get("/", response_model=List[ProgressoResponse])
async def get_my_progress(
    skip: int = 0,
    limit: int = 100,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém o histórico de progresso do usuário autenticado"""
    try:
        query = db.query(Progresso).filter(Progresso.usuario_id == current_user.id)
        
        # Filtros opcionais por data
        if data_inicio:
            query = query.filter(Progresso.data_medicao >= data_inicio)
        if data_fim:
            query = query.filter(Progresso.data_medicao <= data_fim)
        
        # Ordena por data de medição (mais recente primeiro)
        query = query.order_by(Progresso.data_medicao.desc())
        
        # Aplica paginação
        progress_entries = query.offset(skip).limit(limit).all()
        
        return progress_entries
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar progresso: {str(e)}"
        )

@router.post("/", response_model=ProgressoResponse)
async def create_progress_entry(
    progress_data: ProgressoCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cria uma nova entrada de progresso para o usuário autenticado"""
    try:
        db_progress_entry = Progresso(**progress_data.dict(), usuario_id=current_user.id)
        db.add(db_progress_entry)
        db.commit()
        db.refresh(db_progress_entry)
        
        return db_progress_entry
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar entrada de progresso: {str(e)}"
        )

@router.get("/{progress_id}", response_model=ProgressoResponse)
async def get_progress_entry(
    progress_id: str,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém uma entrada específica de progresso"""
    try:
        progress_entry = db.query(Progresso).filter(Progresso.id == progress_id).first()
        
        if not progress_entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrada de progresso não encontrada"
            )
        
        # Verifica se o usuário tem permissão para ver esta entrada
        if progress_entry.usuario_id != current_user.id and current_user.role != "admin":
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
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza uma entrada de progresso"""
    try:
        # Verifica se a entrada existe e pertence ao usuário
        progress_entry = db.query(Progresso).filter(Progresso.id == progress_id).first()
        
        if not progress_entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrada de progresso não encontrada"
            )
        
        if progress_entry.usuario_id != current_user.id and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para atualizar esta entrada de progresso"
            )
        
        # Prepara dados para atualização
        for key, value in progress_update.dict(exclude_unset=True).items():
            setattr(progress_entry, key, value)
        
        db.commit()
        db.refresh(progress_entry)
        
        return progress_entry
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
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Exclui uma entrada de progresso"""
    try:
        # Verifica se a entrada existe e pertence ao usuário
        progress_entry = db.query(Progresso).filter(Progresso.id == progress_id).first()
        
        if not progress_entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrada de progresso não encontrada"
            )
        
        if progress_entry.usuario_id != current_user.id and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para excluir esta entrada de progresso"
            )
        
        # Exclui entrada
        db.delete(progress_entry)
        db.commit()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir progresso: {str(e)}"
        )

@router.get("/stats/summary")
async def get_progress_summary(current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Obtém um resumo estatístico do progresso do usuário
    """
    try:
        # Busca todas as entradas de progresso do usuário
        medicoes = db.query(Progresso).filter(Progresso.usuario_id == current_user.id).order_by(Progresso.data_medicao.asc()).all()
        
        if not medicoes or len(medicoes) == 0:
            return {
                "total_medicoes": 0,
                "primeira_medicao": None,
                "ultima_medicao": None,
                "evolucao_peso": None,
                "evolucao_gordura": None
            }
        
        primeira = medicoes[0]
        ultima = medicoes[-1]
        
        # Calcula evoluções
        evolucao_peso = None
        if primeira.peso is not None and ultima.peso is not None:
            evolucao_peso = ultima.peso - primeira.peso
        
        evolucao_gordura = None
        if primeira.percentual_gordura is not None and ultima.percentual_gordura is not None:
            evolucao_gordura = ultima.percentual_gordura - primeira.percentual_gordura
        
        return {
            "total_medicoes": len(medicoes),
            "primeira_medicao": primeira.data_medicao,
            "ultima_medicao": ultima.data_medicao,
            "evolucao_peso": evolucao_peso,
            "evolucao_gordura": evolucao_gordura,
            "peso_atual": ultima.peso,
            "gordura_atual": ultima.percentual_gordura
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao calcular resumo de progresso: {str(e)}"
        )


