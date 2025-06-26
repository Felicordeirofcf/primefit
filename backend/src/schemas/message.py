from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MessageCreate(BaseModel):
    sender: str
    receiver: str
    content: str

class MessageResponse(BaseModel):
    id: Optional[str] = None
    sender: str
    receiver: str
    timestamp: datetime
    content: str

    class Config:
        from_attributes = True
