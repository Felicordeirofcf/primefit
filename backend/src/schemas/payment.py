from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Modelo para pagamento
class Payment(BaseModel):
    id: Optional[str] = None
    user_id: str
    amount: float
    status: str  # "pending", "completed", "failed", "refunded"
    payment_method: str  # "credit_card", "pix", "bank_transfer"
    transaction_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Modelo para criação de pagamento
class PaymentCreate(BaseModel):
    user_id: str
    amount: float
    payment_method: str
    
    class Config:
        from_attributes = True

# Modelo para assinatura
class Subscription(BaseModel):
    id: Optional[str] = None
    user_id: str
    plan_id: str
    status: str  # "active", "canceled", "expired", "pending"
    start_date: datetime
    end_date: Optional[datetime] = None
    auto_renew: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Modelo para plano de assinatura
class Plan(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    price: float
    duration_days: int
    features: List[str]
    is_active: bool = True
    
    class Config:
        from_attributes = True
