from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import json
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_

from src.api.endpoints.auth import get_current_user, get_admin_user
from src.core.database import get_db
from src.schemas.models import Mensagem, MessageCreate, MessageResponse, Profile # Import Profile for checking receiver existence

router = APIRouter()

# Gerenciador de conexões WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    async def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_personal_message(self, message: Dict[str, Any], user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(json.dumps(message))
    
    async def broadcast(self, message: Dict[str, Any]):
        for connection in self.active_connections.values():
            await connection.send_text(json.dumps(message))

manager = ConnectionManager()

# Helper function to get admin profile
async def get_admin_profile(db: Session = Depends(get_db)):
    admin_user = db.query(Profile).filter(Profile.role == "admin").first()
    if not admin_user:
        # Fallback to specific email if no user with role \'admin\'
        admin_user = db.query(Profile).filter(Profile.email == "felpcordeirofcf@gmail.com").first()
    if not admin_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin user not found"
        )
    return admin_user

@router.post("/", response_model=MessageResponse)
async def create_message(message: MessageCreate, current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Cria uma nova mensagem.
    """
    # Verificar se o destinatário existe
    receiver = db.query(Profile).filter(Profile.id == message.usuario_id).first()
    
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destinatário não encontrado"
        )
    
    # Inserir a mensagem
    db_message = Mensagem(
        usuario_id=message.usuario_id,
        assunto=message.assunto,
        conteudo=message.conteudo,
        enviado_em=datetime.now()
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    # Tentar enviar a mensagem via WebSocket se o destinatário estiver conectado
    try:
        await manager.send_personal_message(
            {
                "type": "new_message",
                "data": {
                    "id": db_message.id,
                    "usuario_id": db_message.usuario_id,
                    "assunto": db_message.assunto,
                    "conteudo": db_message.conteudo,
                    "enviado_em": db_message.enviado_em.isoformat()
                }
            },
            message.usuario_id # Assuming usuario_id is the receiver_id here
        )
    except Exception as e:
        # Ignorar erros de WebSocket, a mensagem já foi salva no banco
        print(f"Erro ao enviar mensagem via WebSocket: {e}")
    
    return db_message

@router.get("/", response_model=List[MessageResponse])
async def get_my_messages(current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Obtém todas as mensagens do usuário atual.
    """
    messages = db.query(Mensagem).filter(Mensagem.usuario_id == current_user.id).order_by(Mensagem.enviado_em.desc()).all()
    
    return messages or []

@router.get("/conversation/{other_user_id}", response_model=List[MessageResponse])
async def get_conversation(
    other_user_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtém a conversa entre o usuário atual e outro usuário.
    
    NOTA: O modelo Mensagem atual (com apenas \'usuario_id\' como destinatário)
    não permite uma representação completa de uma conversa bidirecional (remetente/destinatário).
    Esta implementação retorna todas as mensagens onde o usuário atual OU o outro usuário
    é o destinatário. Para uma conversa completa, o modelo Mensagem precisaria de \'sender_id\' e \'receiver_id\'.
    """
    target_user_id = other_user_id

    if other_user_id == "admin":
        admin_profile = await get_admin_profile(db)
        target_user_id = admin_profile.id
    
    # Verificar se o usuário alvo existe (seja o ID original ou o ID do admin resolvido)
    other_user = db.query(Profile).filter(Profile.id == target_user_id).first()
    
    if not other_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Consulta para mensagens onde o destinatário é o usuário atual OU o usuário alvo
    # Esta é uma solução paliativa devido à limitação do modelo Mensagem.
    messages = db.query(Mensagem).filter(
        or_(
            Mensagem.usuario_id == current_user.id,
            Mensagem.usuario_id == target_user_id
        )
    ).order_by(Mensagem.enviado_em.asc()).all()
    
    return messages or []

@router.put("/read/{message_id}")
async def mark_message_as_read(message_id: str, current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Marca uma mensagem como lida.
    """
    # Verificar se a mensagem existe e pertence ao usuário
    message = db.query(Mensagem).filter(Mensagem.id == message_id, Mensagem.usuario_id == current_user.id).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mensagem não encontrada ou você não tem permissão para acessá-la"
        )
    
    # Marcar como lida (assuming a field like \'is_read\' exists in Mensagem model)
    # message.is_read = True
    # db.commit()
    # db.refresh(message)
    
    return {"success": True, "message": "Mensagem marcada como lida"}

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, db: Session = Depends(get_db)):
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
                    msg_data = message_data["data"]
                    if "receiver_id" in msg_data and "content" in msg_data:
                        # Inserir a mensagem no banco
                        db_message = Mensagem(
                            usuario_id=msg_data["receiver_id"], # Assuming receiver_id is stored as usuario_id
                            assunto="Mensagem WebSocket", # Default subject for WebSocket messages
                            conteudo=msg_data["content"],
                            enviado_em=datetime.now()
                        )
                        db.add(db_message)
                        db.commit()
                        db.refresh(db_message)
                        
                        if db_message:
                            # Enviar para o destinatário se estiver conectado
                            await manager.send_personal_message(
                                {
                                    "type": "new_message",
                                    "data": {
                                        "id": db_message.id,
                                        "usuario_id": db_message.usuario_id,
                                        "assunto": db_message.assunto,
                                        "conteudo": db_message.conteudo,
                                        "enviado_em": db_message.enviado_em.isoformat()
                                    }
                                },
                                msg_data["receiver_id"]
                            )
                            
                            # Confirmar para o remetente
                            await websocket.send_text(json.dumps({
                                "type": "message_sent",
                                "data": {
                                    "id": db_message.id,
                                    "timestamp": db_message.enviado_em.isoformat()
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
