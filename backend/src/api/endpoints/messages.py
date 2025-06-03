from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from src.core.supabase_client import supabase
from src.api.endpoints.auth import get_current_user
from src.schemas.models import MensagemCreate, MensagemResponse

router = APIRouter()

@router.get("/", response_model=List[MensagemResponse])
async def get_my_messages(
    skip: int = 0,
    limit: int = 100,
    apenas_nao_lidas: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """Obtém as mensagens do usuário autenticado (enviadas e recebidas)"""
    try:
        query = supabase.table("mensagens").select("*")
        
        # Filtra mensagens onde o usuário é remetente ou destinatário
        query = query.or_(f"remetente_id.eq.{current_user['id']},destinatario_id.eq.{current_user['id']}")
        
        # Filtro opcional para apenas mensagens não lidas
        if apenas_nao_lidas:
            query = query.eq("lida", False).eq("destinatario_id", current_user["id"])
        
        # Ordena por data de envio (mais recente primeiro)
        query = query.order("data_envio", desc=True)
        
        # Aplica paginação
        response = query.range(skip, skip + limit).execute()
        
        if not response.data:
            return []
        
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar mensagens: {str(e)}"
        )

@router.post("/", response_model=MensagemResponse)
async def send_message(
    message_data: MensagemCreate,
    current_user: dict = Depends(get_current_user)
):
    """Envia uma nova mensagem"""
    try:
        # Verifica se o destinatário existe
        response = supabase.table("profiles").select("id").eq("id", message_data.destinatario_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Destinatário não encontrado"
            )
        
        # Prepara dados para inserção
        message_dict = message_data.dict()
        message_dict["remetente_id"] = current_user["id"]
        
        # Insere mensagem no Supabase
        response = supabase.table("mensagens").insert(message_dict).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao enviar mensagem"
            )
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao enviar mensagem: {str(e)}"
        )

@router.get("/{message_id}", response_model=MensagemResponse)
async def get_message(
    message_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Obtém uma mensagem específica"""
    try:
        response = supabase.table("mensagens").select("*").eq("id", message_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mensagem não encontrada"
            )
        
        message = response.data[0]
        
        # Verifica se o usuário tem permissão para ver esta mensagem
        if (message["remetente_id"] != current_user["id"] and 
            message["destinatario_id"] != current_user["id"] and 
            current_user.get("role") != "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para acessar esta mensagem"
            )
        
        return message
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar mensagem: {str(e)}"
        )

@router.put("/{message_id}/marcar-lida", response_model=MensagemResponse)
async def mark_message_as_read(
    message_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Marca uma mensagem como lida"""
    try:
        # Verifica se a mensagem existe e o usuário é o destinatário
        response = supabase.table("mensagens").select("*").eq("id", message_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mensagem não encontrada"
            )
        
        message = response.data[0]
        
        if message["destinatario_id"] != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas o destinatário pode marcar a mensagem como lida"
            )
        
        # Atualiza mensagem como lida
        from datetime import datetime
        update_data = {
            "lida": True,
            "data_leitura": datetime.utcnow().isoformat()
        }
        
        response = supabase.table("mensagens").update(update_data).eq("id", message_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao marcar mensagem como lida"
            )
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao marcar mensagem como lida: {str(e)}"
        )

@router.get("/conversas/lista")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    """Obtém lista de conversas do usuário com contagem de mensagens não lidas"""
    try:
        # Busca todas as mensagens do usuário
        response = supabase.table("mensagens").select("*").or_(
            f"remetente_id.eq.{current_user['id']},destinatario_id.eq.{current_user['id']}"
        ).order("data_envio", desc=True).execute()
        
        if not response.data:
            return []
        
        # Agrupa mensagens por conversa
        conversas = {}
        
        for msg in response.data:
            # Determina o ID do outro participante da conversa
            outro_id = msg["destinatario_id"] if msg["remetente_id"] == current_user["id"] else msg["remetente_id"]
            
            if outro_id not in conversas:
                conversas[outro_id] = {
                    "participante_id": outro_id,
                    "ultima_mensagem": msg,
                    "total_mensagens": 0,
                    "nao_lidas": 0
                }
            
            conversas[outro_id]["total_mensagens"] += 1
            
            # Conta mensagens não lidas (apenas as recebidas pelo usuário atual)
            if (msg["destinatario_id"] == current_user["id"] and not msg["lida"]):
                conversas[outro_id]["nao_lidas"] += 1
        
        # Busca informações dos participantes
        for conversa in conversas.values():
            profile_response = supabase.table("profiles").select("nome, email").eq("id", conversa["participante_id"]).execute()
            if profile_response.data:
                conversa["participante_nome"] = profile_response.data[0]["nome"]
                conversa["participante_email"] = profile_response.data[0]["email"]
        
        return list(conversas.values())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar conversas: {str(e)}"
        )

@router.get("/conversa/{outro_usuario_id}", response_model=List[MensagemResponse])
async def get_conversation_with_user(
    outro_usuario_id: str,
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Obtém todas as mensagens de uma conversa específica"""
    try:
        # Busca mensagens entre os dois usuários
        response = supabase.table("mensagens").select("*").or_(
            f"and(remetente_id.eq.{current_user['id']},destinatario_id.eq.{outro_usuario_id}),"
            f"and(remetente_id.eq.{outro_usuario_id},destinatario_id.eq.{current_user['id']})"
        ).order("data_envio", desc=False).range(skip, skip + limit).execute()
        
        if not response.data:
            return []
        
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar conversa: {str(e)}"
        )

@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Exclui uma mensagem (apenas o remetente ou admin)"""
    try:
        # Verifica se a mensagem existe
        response = supabase.table("mensagens").select("*").eq("id", message_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mensagem não encontrada"
            )
        
        message = response.data[0]
        
        # Verifica permissão (apenas remetente ou admin)
        if message["remetente_id"] != current_user["id"] and current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para excluir esta mensagem"
            )
        
        # Exclui mensagem do Supabase
        supabase.table("mensagens").delete().eq("id", message_id).execute()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir mensagem: {str(e)}"
        )

