from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Message(BaseModel):
    id: Optional[str] = None
    sender: str
    receiver: str
    timestamp: datetime
    content: str

    class Config:
        from_attributes = True


