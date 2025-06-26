from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from src.core.database import get_db
from routes.auth import get_current_user
from src.schemas.models import Avaliacao, AvaliacaoCreate, AvaliacaoResponse
from src.core.models import Usuario

router = APIRouter()

@router.get("/", response_model=List[AvaliacaoResponse])
async def get_my_assessments(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém as avaliações do usuário autenticado"""
    try:
        query = db.query(Avaliacao).filter(Avaliacao.usuario_id == current_user.id)
        
        # Filtro opcional por status
        if status_filter:
            query = query.filter(Avaliacao.status == status_filter)
        
        # Ordena por data de criação (mais recente primeiro)
        query = query.order_by(Avaliacao.data.desc())
        
        # Aplica paginação
        assessments = query.offset(skip).limit(limit).all()
        
        return assessments
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar avaliações: {str(e)}"
        )

@router.post("/", response_model=AvaliacaoResponse)
async def create_assessment(
    assessment_data: AvaliacaoCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cria uma nova avaliação para o usuário autenticado"""
    try:
        db_assessment = Avaliacao(**assessment_data.dict(), usuario_id=current_user.id)
        db.add(db_assessment)
        db.commit()
        db.refresh(db_assessment)
        
        return db_assessment
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar avaliação: {str(e)}"
        )

@router.get("/{assessment_id}", response_model=AvaliacaoResponse)
async def get_assessment(
    assessment_id: str,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém uma avaliação específica"""
    try:
        assessment = db.query(Avaliacao).filter(Avaliacao.id == assessment_id).first()
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )
        
        # Verifica se o usuário tem permissão para ver esta avaliação
        if (assessment.usuario_id != current_user.id and 
            assessment.avaliador_id != current_user.id and 
            current_user.role != "admin"):
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
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza uma avaliação"""
    try:
        # Verifica se a avaliação existe
        assessment = db.query(Avaliacao).filter(Avaliacao.id == assessment_id).first()
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )
        
        # Verifica permissões
        if (assessment.usuario_id != current_user.id and 
            assessment.avaliador_id != current_user.id and 
            current_user.role != "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para atualizar esta avaliação"
            )
        
        # Atualiza avaliação
        for key, value in assessment_update.dict(exclude_unset=True).items():
            setattr(assessment, key, value)
        
        db.commit()
        db.refresh(assessment)
        
        return assessment
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
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza o status de uma avaliação (apenas para avaliadores e admins)"""
    try:
        # Verifica se a avaliação existe
        assessment = db.query(Avaliacao).filter(Avaliacao.id == assessment_id).first()
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )
        
        # Verifica permissões (apenas avaliador ou admin)
        if (assessment.avaliador_id != current_user.id and 
            current_user.role != "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para atualizar o status desta avaliação"
            )
        
        # Valida o novo status
        valid_statuses = ["pendente", "em_andamento", "concluida", "cancelada"]
        if new_status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Status inválido. Valores aceitos: {", ".join(valid_statuses)}"
            )
        
        # Atualiza status
        assessment.status = new_status
        db.commit()
        db.refresh(assessment)
        
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
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém todas as avaliações (apenas para admins)"""
    # Verifica se o usuário tem permissão de administrador
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar esta funcionalidade"
        )
    
    try:
        query = db.query(Avaliacao)
        
        # Filtros opcionais
        if usuario_id:
            query = query.filter(Avaliacao.usuario_id == usuario_id)
        if status_filter:
            query = query.filter(Avaliacao.status == status_filter)
        
        # Ordena por data de criação (mais recente primeiro)
        query = query.order_by(Avaliacao.data.desc())
        
        # Aplica paginação
        assessments = query.offset(skip).limit(limit).all()
        
        return assessments
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar avaliações: {str(e)}"
        )

@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assessment(
    assessment_id: str,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Exclui uma avaliação (apenas para admins)"""
    # Verifica se o usuário tem permissão de administrador
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para excluir avaliações"
        )
    
    try:
        # Verifica se a avaliação existe
        assessment = db.query(Avaliacao).filter(Avaliacao.id == assessment_id).first()
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )
        
        # Exclui avaliação
        db.delete(assessment)
        db.commit()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir avaliação: {str(e)}"
        )


