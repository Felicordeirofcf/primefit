from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Assessment(BaseModel):
    id: Optional[str] = None
    type: str
    score: Optional[float] = None
    date: Optional[datetime] = None

    class Config:
        from_attributes = True


