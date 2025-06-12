from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from src.core.database import get_db
from routes.auth import get_current_user
from src.schemas.models import Profile as UserProfile, PerfilResponse as UserResponse, Cadastro as UserUpdate # Assuming Cadastro is used for UserUpdate

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
async def get_users(
    # Query parameters para filtros dinâmicos
    email: Optional[str] = None,
    nome: Optional[str] = None,
    role: Optional[str] = None,
    tipo_usuario: Optional[str] = None,
    # Parâmetros de paginação
    skip: int = 0, 
    limit: int = 100,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verifica se o usuário tem permissão de administrador
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar esta funcionalidade"
        )
    
    try:
        # Construção da query base
        query = db.query(UserProfile)
        
        # Aplicação de filtros dinâmicos
        if email:
            query = query.filter(UserProfile.email == email)
        if nome:
            query = query.filter(UserProfile.nome.ilike(f"%{nome}%"))
        if role:
            query = query.filter(UserProfile.role == role)
        if tipo_usuario:
            query = query.filter(UserProfile.tipo_usuario == tipo_usuario)
        
        # Execução da query com paginação
        users = query.offset(skip).limit(limit).all()
        
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar usuários: {str(e)}"
        )

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verifica se o usuário está buscando seu próprio perfil ou é um admin
    if current_user["id"] != user_id and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar este perfil"
        )
    
    try:
        user = db.query(UserProfile).filter(UserProfile.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        return user
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
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verifica se o usuário está atualizando seu próprio perfil ou é um admin
    if current_user["id"] != user_id and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para atualizar este perfil"
        )
    
    try:
        user = db.query(UserProfile).filter(UserProfile.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        for key, value in user_update.dict(exclude_unset=True).items():
            setattr(user, key, value)
        
        db.commit()
        db.refresh(user)
        
        return user
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
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Apenas administradores podem excluir usuários
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para excluir usuários"
        )
    
    try:
        user = db.query(UserProfile).filter(UserProfile.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        db.delete(user)
        db.commit()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir usuário: {str(e)}"
        )


