from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from src.core.database import get_db
from src.core.models import Message as DBMessage
from src.schemas.message import Message

router = APIRouter()

@router.get("/messages", response_model=List[Message])
async def get_messages(db: Session = Depends(get_db)):
    messages = db.query(DBMessage).all()
    if not messages:
        return []
    return messages

@router.post("/messages", response_model=Message)
async def create_message(message: Message, db: Session = Depends(get_db)):
    db_message = DBMessage(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get("/messages/conversation/admin", response_model=List[Message])
async def get_admin_conversation(db: Session = Depends(get_db)):
    # Assuming 'admin' is a specific sender/receiver or a role
    # This example fetches messages where either sender or receiver is 'admin'
    messages = db.query(DBMessage).filter(
        (DBMessage.sender == "admin") | (DBMessage.receiver == "admin")
    ).all()
    if not messages:
        return []
    return messages


