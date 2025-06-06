from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from src.core.supabase_client import get_supabase_client
supabase = get_supabase_client()
from src.api.endpoints.auth import get_current_user
from src.schemas.content import Content, ContentCreate, Comment

router = APIRouter()

# Rotas para conteúdo
@router.post("/", response_model=Content)
async def create_content(
    content: ContentCreate,
    current_user: dict = Depends(get_current_user)
):
    # Apenas administradores e personal trainers podem criar conteúdo
    if current_user["role"] not in ["admin", "trainer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para criar conteúdo"
        )
    
    try:
        # Prepara dados para inserção
        content_data = content.dict()
        content_data["author_id"] = current_user["id"]
        content_data["created_at"] = "now()"  # Função SQL para data atual
        
        # Insere conteúdo no Supabase
        response = supabase.table("contents").insert(content_data).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar conteúdo"
            )
        
        return response.data[0]
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
    current_user: dict = Depends(get_current_user)
):
    try:
        # Monta a query
        query = supabase.table("contents").select("*")
        
        # Aplica filtros se fornecidos
        if category:
            query = query.eq("category", category)
        
        if published is not None:
            query = query.eq("published", published)
        
        # Filtro por tag é mais complexo, pois tags é um array
        if tag:
            query = query.contains("tags", [tag])
        
        # Ordena por data de criação decrescente
        query = query.order("created_at", desc=True)
        
        response = query.execute()
        
        if not response.data:
            return []
        
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar conteúdos: {str(e)}"
        )

@router.get("/{content_id}", response_model=Content)
async def get_content(
    content_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Busca o conteúdo
        response = supabase.table("contents").select("*").eq("id", content_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conteúdo não encontrado"
            )
        
        content = response.data[0]
        
        # Se o conteúdo não estiver publicado, apenas o autor e administradores podem vê-lo
        if not content["published"] and current_user["id"] != content["author_id"] and current_user["role"] != "admin":
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
    current_user: dict = Depends(get_current_user)
):
    try:
        # Verifica se o conteúdo existe
        response = supabase.table("contents").select("*").eq("id", content_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conteúdo não encontrado"
            )
        
        content = response.data[0]
        
        # Apenas o autor e administradores podem atualizar o conteúdo
        if current_user["id"] != content["author_id"] and current_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para atualizar este conteúdo"
            )
        
        # Prepara dados para atualização
        update_data = content_update.dict()
        update_data["updated_at"] = "now()"  # Função SQL para data atual
        
        # Atualiza conteúdo no Supabase
        response = supabase.table("contents").update(update_data).eq("id", content_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao atualizar conteúdo"
            )
        
        return response.data[0]
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
    current_user: dict = Depends(get_current_user)
):
    try:
        # Verifica se o conteúdo existe
        response = supabase.table("contents").select("*").eq("id", content_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conteúdo não encontrado"
            )
        
        content = response.data[0]
        
        # Apenas o autor e administradores podem excluir o conteúdo
        if current_user["id"] != content["author_id"] and current_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para excluir este conteúdo"
            )
        
        # Exclui conteúdo do Supabase
        supabase.table("contents").delete().eq("id", content_id).execute()
        
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
    text: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Verifica se o conteúdo existe
        response = supabase.table("contents").select("*").eq("id", content_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conteúdo não encontrado"
            )
        
        # Prepara dados para inserção
        comment_data = {
            "content_id": content_id,
            "user_id": current_user["id"],
            "text": text,
            "created_at": "now()"  # Função SQL para data atual
        }
        
        # Insere comentário no Supabase
        response = supabase.table("comments").insert(comment_data).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar comentário"
            )
        
        return response.data[0]
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
    current_user: dict = Depends(get_current_user)
):
    try:
        # Verifica se o conteúdo existe
        content_response = supabase.table("contents").select("*").eq("id", content_id).execute()
        
        if not content_response.data or len(content_response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conteúdo não encontrado"
            )
        
        # Busca comentários
        response = supabase.table("comments").select("*").eq("content_id", content_id).order("created_at", desc=True).execute()
        
        if not response.data:
            return []
        
        return response.data
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
    current_user: dict = Depends(get_current_user)
):
    try:
        # Verifica se o comentário existe
        response = supabase.table("comments").select("*").eq("id", comment_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comentário não encontrado"
            )
        
        comment = response.data[0]
        
        # Apenas o autor do comentário e administradores podem excluí-lo
        if current_user["id"] != comment["user_id"] and current_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para excluir este comentário"
            )
        
        # Exclui comentário do Supabase
        supabase.table("comments").delete().eq("id", comment_id).execute()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir comentário: {str(e)}"
        )
