from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Modelo para avaliação física
class Assessment(BaseModel):
    id: Optional[str] = None
    user_id: str
    date: datetime
    weight: float  # em kg
    height: Optional[float] = None  # em cm
    body_fat_percentage: Optional[float] = None
    muscle_mass: Optional[float] = None  # em kg
    bmi: Optional[float] = None  # Índice de Massa Corporal
    waist: Optional[float] = None  # em cm
    hip: Optional[float] = None  # em cm
    chest: Optional[float] = None  # em cm
    arms: Optional[float] = None  # em cm
    thighs: Optional[float] = None  # em cm
    notes: Optional[str] = None
    trainer_id: str  # ID do personal trainer que realizou a avaliação
    
    class Config:
        from_attributes = True

# Modelo para criação de avaliação física
class AssessmentCreate(BaseModel):
    user_id: str
    date: datetime
    weight: float
    height: Optional[float] = None
    body_fat_percentage: Optional[float] = None
    muscle_mass: Optional[float] = None
    waist: Optional[float] = None
    hip: Optional[float] = None
    chest: Optional[float] = None
    arms: Optional[float] = None
    thighs: Optional[float] = None
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True

# Modelo para resposta de avaliação física
class AssessmentResponse(Assessment):
    waist_hip_ratio: Optional[float] = None
    previous_weight: Optional[float] = None
    weight_change: Optional[float] = None
    weight_change_percentage: Optional[float] = None
    
    class Config:
        from_attributes = True
