from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Progress(BaseModel):
    id: Optional[str] = None
    date: datetime
    weight: float
    height: float
    bmi: float

    class Config:
        from_attributes = True


