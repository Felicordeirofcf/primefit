from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SubscriptionCreate(BaseModel):
    usuario_id: str
    plano_id: str
    status: str
    data_inicio: datetime
    data_fim: datetime
    valor_pago: float

class SubscriptionResponse(BaseModel):
    id: str
    usuario_id: str
    plano_id: str
    status: str
    data_inicio: datetime
    data_fim: datetime
    valor_pago: float

    class Config:
        from_attributes = True


