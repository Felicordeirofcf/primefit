import os
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import json
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_

from src.api.endpoints.auth import get_current_user, get_admin_user, get_current_websocket_user
from src.core.database import get_db
from src.schemas.models import Mensagem, MessageCreate, MessageResponse, Profile

router = APIRouter()

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
async def create_message(message: MessageCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    receiver = db.query(Profile).filter(Profile.id == message.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Destinatário não encontrado")

    db_message = Mensagem(
        sender_id=current_user["id"],
        receiver_id=message.receiver_id,
        content=message.content,
        created_at=datetime.utcnow(),
        is_read=False
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)

    try:
        await manager.send_personal_message({"type": "new_message", "data": {
            "id": db_message.id,
            "sender_id": db_message.sender_id,
            "receiver_id": db_message.receiver_id,
            "content": db_message.content,
            "created_at": db_message.created_at.isoformat(),
            "is_read": db_message.is_read
        }}, db_message.receiver_id)
    except Exception as e:
        print(f"Erro ao enviar WebSocket: {e}")

    return db_message

@router.get("/", response_model=List[MessageResponse])
async def get_my_messages(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    messages = db.query(Mensagem).filter(or_(Mensagem.sender_id == current_user["id"], Mensagem.receiver_id == current_user["id"]))\
                .order_by(Mensagem.created_at.desc()).all()
    return messages

@router.get("/conversation/{other_user_id}", response_model=List[MessageResponse])
async def get_conversation(other_user_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    other_user = db.query(Profile).filter(Profile.id == other_user_id).first()
    if not other_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    messages = db.query(Mensagem).filter(
        or_(
            (Mensagem.sender_id == current_user["id"]) & (Mensagem.receiver_id == other_user_id),
            (Mensagem.sender_id == other_user_id) & (Mensagem.receiver_id == current_user["id"])
        )
    ).order_by(Mensagem.created_at.asc()).all()

    return messages

@router.put("/read/{message_id}")
async def mark_message_as_read(message_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    message = db.query(Mensagem).filter(Mensagem.id == message_id, Mensagem.receiver_id == current_user["id"]).first()
    if not message:
        raise HTTPException(status_code=404, detail="Mensagem não encontrada")

    message.is_read = True
    db.commit()
    db.refresh(message)
    return {"success": True, "message": "Mensagem marcada como lida"}

@router.websocket("/messages/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, db: Session = Depends(get_db)):
    token = websocket.query_params.get("token")
    current_user = await get_current_websocket_user(token=token)

    if current_user["id"] != user_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            if message_data["type"] == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
            elif message_data["type"] == "message":
                msg = message_data["data"]
                db_message = Mensagem(
                    sender_id=current_user["id"],
                    receiver_id=msg["receiver_id"],
                    content=msg["content"],
                    created_at=datetime.utcnow(),
                    is_read=False
                )
                db.add(db_message)
                db.commit()
                db.refresh(db_message)
                await manager.send_personal_message({"type": "new_message", "data": {
                    "id": db_message.id,
                    "sender_id": db_message.sender_id,
                    "receiver_id": db_message.receiver_id,
                    "content": db_message.content,
                    "created_at": db_message.created_at.isoformat(),
                    "is_read": db_message.is_read
                }}, db_message.receiver_id)
                await websocket.send_text(json.dumps({"type": "message_sent", "data": {"id": db_message.id}}))
    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        print(f"Erro no WebSocket: {e}")
        manager.disconnect(user_id)
