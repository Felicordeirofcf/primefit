from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Modelo para exercício
class Exercise(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    muscle_group: str
    equipment: Optional[str] = None
    video_url: Optional[str] = None
    
    class Config:
        from_attributes = True

# Modelo para série de exercício
class ExerciseSet(BaseModel):
    exercise_id: str
    sets: int
    reps: int
    weight: Optional[float] = None
    rest_time: Optional[int] = None  # em segundos
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True

# Modelo para treino
class Training(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    day_of_week: Optional[str] = None  # Segunda, Terça, etc.
    exercise_sets: List[ExerciseSet]
    
    class Config:
        from_attributes = True

# Modelo para plano de treino
class TrainingPlan(BaseModel):
    id: Optional[str] = None
    user_id: str
    name: str
    description: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    trainings: List[Training]
    created_by: str  # ID do personal trainer
    
    class Config:
        from_attributes = True

# Modelo para registro de treino realizado
class TrainingLog(BaseModel):
    id: Optional[str] = None
    user_id: str
    training_id: str
    date: datetime
    completed: bool
    duration: Optional[int] = None  # em minutos
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True
