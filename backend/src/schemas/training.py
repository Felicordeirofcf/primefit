from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Training(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    date: Optional[datetime] = None

    class Config:
        from_attributes = True



