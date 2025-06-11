from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List, Optional
from sqlalchemy.orm import Session
from src.core.database import get_db
from routes.auth import get_current_user
from src.schemas.models import TreinoEnviado, TreinoCreate, TreinoResponse, Profile

router = APIRouter()

@router.get("/", response_model=List[TreinoResponse])
async def get_my_trainings(
    skip: int = 0,
    limit: int = 100,
    apenas_ativos: bool = True,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém os treinos do usuário autenticado"""
    try:
        query = db.query(TreinoEnviado).filter(TreinoEnviado.usuario_id == current_user["id"])
        
        # Filtro opcional para apenas treinos ativos
        if apenas_ativos:
            query = query.filter(TreinoEnviado.ativo == True)
        
        # Ordena por data de envio (mais recente primeiro)
        query = query.order_by(TreinoEnviado.enviado_em.desc())
        
        # Aplica paginação
        trainings = query.offset(skip).limit(limit).all()
        
        return trainings
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar treinos: {str(e)}"
        )

@router.get("/{training_id}", response_model=TreinoResponse)
async def get_training(
    training_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém um treino específico"""
    try:
        training = db.query(TreinoEnviado).filter(TreinoEnviado.id == training_id).first()
        
        if not training:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Treino não encontrado"
            )
        
        # Verifica se o usuário tem permissão para ver este treino
        if training.usuario_id != current_user["id"] and current_user.get("role") != "admin":
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
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
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
        client_profile = db.query(Profile).filter(Profile.id == training_data.usuario_id).first()
        
        if not client_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente não encontrado"
            )
        
        db_training = TreinoEnviado(**training_data.dict(), usuario_id=training_data.usuario_id)
        db.add(db_training)
        db.commit()
        db.refresh(db_training)
        
        return db_training
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
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
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
        training = db.query(TreinoEnviado).filter(TreinoEnviado.id == training_id).first()
        
        if not training:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Treino não encontrado"
            )
        
        # Prepara dados para atualização
        for key, value in training_update.dict(exclude_unset=True).items():
            setattr(training, key, value)
        
        db.commit()
        db.refresh(training)
        
        return training
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
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
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
        training = db.query(TreinoEnviado).filter(TreinoEnviado.id == training_id).first()
        
        if not training:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Treino não encontrado"
            )
        
        # Marca treino como inativo ao invés de excluir
        training.ativo = False # Assuming 'ativo' column exists in TreinoEnviado model
        db.commit()
        db.refresh(training)
        
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
    usuario_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém todos os treinos (apenas para admins)"""
    # Verifica se o usuário tem permissão de administrador
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar esta funcionalidade"
        )
    
    try:
        query = db.query(TreinoEnviado)
        
        # Filtro opcional por cliente
        if usuario_id:
            query = query.filter(TreinoEnviado.usuario_id == usuario_id)
        
        # Ordena por data de envio (mais recente primeiro)
        query = query.order_by(TreinoEnviado.enviado_em.desc())
        
        # Aplica paginação
        trainings = query.offset(skip).limit(limit).all()
        
        return trainings
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar treinos: {str(e)}"
        )


