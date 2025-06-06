"""
Endpoints para gerenciamento de mensagens
"""
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import json
import asyncio
from datetime import datetime

from src.api.endpoints.auth import get_current_user, get_admin_user
from src.core.db_client import execute_query
from src.schemas.models import MessageCreate, MessageResponse

router = APIRouter()

# Gerenciador de conexões WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_personal_message(self, message: Dict[str, Any], user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(json.dumps(message))
    
    async def broadcast(self, message: Dict[str, Any]):
        for connection in self.active_connections.values():
            await connection.send_text(json.dumps(message))

manager = ConnectionManager()

@router.post("/", response_model=MessageResponse)
async def create_message(message: MessageCreate, current_user = Depends(get_current_user)):
    """
    Cria uma nova mensagem.
    """
    # Verificar se o destinatário existe
    receiver = execute_query(
        "SELECT * FROM users WHERE id = %s",
        (message.receiver_id,)
    )
    
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destinatário não encontrado"
        )
    
    # Inserir a mensagem
    new_message = execute_query(
        """
        INSERT INTO mensagens (sender_id, receiver_id, content, is_read)
        VALUES (%s, %s, %s, %s)
        RETURNING *
        """,
        (current_user['id'], message.receiver_id, message.content, False)
    )
    
    if not new_message:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Falha ao enviar mensagem"
        )
    
    # Tentar enviar a mensagem via WebSocket se o destinatário estiver conectado
    try:
        await manager.send_personal_message(
            {
                "type": "new_message",
                "data": {
                    "id": new_message[0]['id'],
                    "sender_id": current_user['id'],
                    "receiver_id": message.receiver_id,
                    "content": message.content,
                    "created_at": new_message[0]['created_at'].isoformat(),
                    "is_read": False
                }
            },
            message.receiver_id
        )
    except Exception as e:
        # Ignorar erros de WebSocket, a mensagem já foi salva no banco
        print(f"Erro ao enviar mensagem via WebSocket: {e}")
    
    return new_message[0]

@router.get("/", response_model=List[MessageResponse])
async def get_my_messages(current_user = Depends(get_current_user)):
    """
    Obtém todas as mensagens do usuário atual.
    """
    messages = execute_query(
        """
        SELECT * FROM mensagens
        WHERE sender_id = %s OR receiver_id = %s
        ORDER BY created_at DESC
        """,
        (current_user['id'], current_user['id'])
    )
    
    return messages or []

@router.get("/conversation/{other_user_id}", response_model=List[MessageResponse])
async def get_conversation(other_user_id: str, current_user = Depends(get_current_user)):
    """
    Obtém a conversa entre o usuário atual e outro usuário.
    """
    # Verificar se o outro usuário existe
    other_user = execute_query(
        "SELECT * FROM users WHERE id = %s",
        (other_user_id,)
    )
    
    if not other_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Obter as mensagens da conversa
    messages = execute_query(
        """
        SELECT * FROM mensagens
        WHERE (sender_id = %s AND receiver_id = %s)
        OR (sender_id = %s AND receiver_id = %s)
        ORDER BY created_at ASC
        """,
        (current_user['id'], other_user_id, other_user_id, current_user['id'])
    )
    
    # Marcar mensagens recebidas como lidas
    execute_query(
        """
        UPDATE mensagens
        SET is_read = TRUE
        WHERE sender_id = %s AND receiver_id = %s AND is_read = FALSE
        """,
        (other_user_id, current_user['id'])
    )
    
    return messages or []

@router.put("/read/{message_id}")
async def mark_message_as_read(message_id: str, current_user = Depends(get_current_user)):
    """
    Marca uma mensagem como lida.
    """
    # Verificar se a mensagem existe e pertence ao usuário
    message = execute_query(
        "SELECT * FROM mensagens WHERE id = %s AND receiver_id = %s",
        (message_id, current_user['id'])
    )
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mensagem não encontrada ou você não tem permissão para acessá-la"
        )
    
    # Marcar como lida
    updated_message = execute_query(
        """
        UPDATE mensagens
        SET is_read = TRUE
        WHERE id = %s
        RETURNING *
        """,
        (message_id,)
    )
    
    return {"success": True, "message": "Mensagem marcada como lida"}

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """
    Endpoint WebSocket para comunicação em tempo real.
    """
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                
                # Validar a mensagem
                if "type" not in message_data or "data" not in message_data:
                    await websocket.send_text(json.dumps({"error": "Formato de mensagem inválido"}))
                    continue
                
                # Processar diferentes tipos de mensagens
                if message_data["type"] == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
                
                elif message_data["type"] == "message":
                    # Aqui você pode implementar a lógica para salvar a mensagem no banco
                    # e encaminhá-la para o destinatário
                    msg_data = message_data["data"]
                    if "receiver_id" in msg_data and "content" in msg_data:
                        # Inserir a mensagem no banco
                        new_message = execute_query(
                            """
                            INSERT INTO mensagens (sender_id, receiver_id, content, is_read)
                            VALUES (%s, %s, %s, %s)
                            RETURNING *
                            """,
                            (user_id, msg_data["receiver_id"], msg_data["content"], False)
                        )
                        
                        if new_message:
                            # Enviar para o destinatário se estiver conectado
                            await manager.send_personal_message(
                                {
                                    "type": "new_message",
                                    "data": {
                                        "id": new_message[0]['id'],
                                        "sender_id": user_id,
                                        "receiver_id": msg_data["receiver_id"],
                                        "content": msg_data["content"],
                                        "created_at": new_message[0]['created_at'].isoformat(),
                                        "is_read": False
                                    }
                                },
                                msg_data["receiver_id"]
                            )
                            
                            # Confirmar para o remetente
                            await websocket.send_text(json.dumps({
                                "type": "message_sent",
                                "data": {
                                    "id": new_message[0]['id'],
                                    "timestamp": new_message[0]['created_at'].isoformat()
                                }
                            }))
                    else:
                        await websocket.send_text(json.dumps({"error": "Dados de mensagem incompletos"}))
                
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"error": "JSON inválido"}))
            except Exception as e:
                await websocket.send_text(json.dumps({"error": str(e)}))
    
    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        print(f"Erro no WebSocket: {e}")
        manager.disconnect(user_id)

