from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from src.core.database import get_db
from routes.auth import get_current_user
from src.schemas.models import Avaliacao, AvaliacaoCreate, AvaliacaoResponse
from src.core.models import Usuario

# ✅ Adiciona prefixo "/assessments" e tag para documentação
router = APIRouter(prefix="/assessments", tags=["Avaliações"])

@router.get("/", response_model=List[AvaliacaoResponse])
async def get_my_assessments(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Avaliacao).filter(Avaliacao.usuario_id == current_user.id)
        if status_filter:
            query = query.filter(Avaliacao.status == status_filter)
        query = query.order_by(Avaliacao.data.desc())
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
    try:
        assessment = db.query(Avaliacao).filter(Avaliacao.id == assessment_id).first()
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )
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
    try:
        assessment = db.query(Avaliacao).filter(Avaliacao.id == assessment_id).first()
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )
        if (assessment.usuario_id != current_user.id and 
            assessment.avaliador_id != current_user.id and 
            current_user.role != "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para atualizar esta avaliação"
            )
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
    try:
        assessment = db.query(Avaliacao).filter(Avaliacao.id == assessment_id).first()
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )
        if (assessment.avaliador_id != current_user.id and 
            current_user.role != "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para atualizar o status desta avaliação"
            )
        valid_statuses = ["pendente", "em_andamento", "concluida", "cancelada"]
        if new_status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Status inválido. Valores aceitos: {', '.join(valid_statuses)}"
            )
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
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar esta funcionalidade"
        )
    try:
        query = db.query(Avaliacao)
        if usuario_id:
            query = query.filter(Avaliacao.usuario_id == usuario_id)
        if status_filter:
            query = query.filter(Avaliacao.status == status_filter)
        query = query.order_by(Avaliacao.data.desc())
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
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para excluir avaliações"
        )
    try:
        assessment = db.query(Avaliacao).filter(Avaliacao.id == assessment_id).first()
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )
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
