from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.api.endpoints.auth import get_current_user
from src.schemas.models import Profile # Assuming Profile is needed for author_id validation
from src.schemas.content import Content, ContentCreate, Comment, CommentCreate # Assuming CommentCreate is needed
from sqlalchemy import func

router = APIRouter()

# Rotas para conteúdo
@router.post("/", response_model=Content)
async def create_content(
    content: ContentCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Apenas administradores e personal trainers podem criar conteúdo
    if current_user["role"] not in ["admin", "trainer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para criar conteúdo"
        )
    
    try:
        db_content = Content(**content.dict(), author_id=current_user["id"], created_at=func.now())
        db.add(db_content)
        db.commit()
        db.refresh(db_content)
        
        return db_content
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar conteúdo: {str(e)}"
        )

@router.get("/", response_model=List[Content])
async def get_contents(
    category: Optional[str] = None,
    tag: Optional[str] = None,
    published: bool = True,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Content)
        
        if category:
            query = query.filter(Content.category == category)
        
        if published is not None:
            query = query.filter(Content.published == published)
        
        # Filtro por tag (assumindo que tags é um array de strings no DB)
        if tag:
            # This might need adjustment based on how tags are stored in PostgreSQL
            # For PostgreSQL array type, you might use .any() or specific array operators
            # For simplicity, assuming a simple string match for now, or adjust schema
            # If tags is a JSONB column, you'd use jsonb_contains
            pass # Placeholder for tag filtering, needs database schema clarification
        
        contents = query.order_by(Content.created_at.desc()).all()
        
        return contents
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar conteúdos: {str(e)}"
        )

@router.get("/{content_id}", response_model=Content)
async def get_content(
    content_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        content = db.query(Content).filter(Content.id == content_id).first()
        
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conteúdo não encontrado"
            )
        
        if not content.published and current_user["id"] != content.author_id and current_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para acessar este conteúdo"
            )
        
        return content
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar conteúdo: {str(e)}"
        )

@router.put("/{content_id}", response_model=Content)
async def update_content(
    content_id: str,
    content_update: ContentCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        content = db.query(Content).filter(Content.id == content_id).first()
        
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conteúdo não encontrado"
            )
        
        if current_user["id"] != content.author_id and current_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para atualizar este conteúdo"
            )
        
        for key, value in content_update.dict(exclude_unset=True).items():
            setattr(content, key, value)
        content.updated_at = func.now()
        
        db.commit()
        db.refresh(content)
        
        return content
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar conteúdo: {str(e)}"
        )

@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_content(
    content_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        content = db.query(Content).filter(Content.id == content_id).first()
        
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conteúdo não encontrado"
            )
        
        if current_user["id"] != content.author_id and current_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para excluir este conteúdo"
            )
        
        db.delete(content)
        db.commit()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir conteúdo: {str(e)}"
        )

# Rotas para comentários
@router.post("/{content_id}/comments", response_model=Comment)
async def create_comment(
    content_id: str,
    comment_data: CommentCreate, # Using CommentCreate Pydantic model
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        content = db.query(Content).filter(Content.id == content_id).first()
        
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conteúdo não encontrado"
            )
        
        db_comment = Comment(**comment_data.dict(), content_id=content_id, user_id=current_user["id"], created_at=func.now())
        db.add(db_comment)
        db.commit()
        db.refresh(db_comment)
        
        return db_comment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar comentário: {str(e)}"
        )

@router.get("/{content_id}/comments", response_model=List[Comment])
async def get_comments(
    content_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        content = db.query(Content).filter(Content.id == content_id).first()
        
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conteúdo não encontrado"
            )
        
        comments = db.query(Comment).filter(Comment.content_id == content_id).order_by(Comment.created_at.desc()).all()
        
        return comments
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar comentários: {str(e)}"
        )

@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        comment = db.query(Comment).filter(Comment.id == comment_id).first()
        
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comentário não encontrado"
            )
        
        if current_user["id"] != comment.user_id and current_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para excluir este comentário"
            )
        
        db.delete(comment)
        db.commit()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir comentário: {str(e)}"
        )


