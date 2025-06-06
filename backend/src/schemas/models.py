"""
Esquemas para modelos de dados
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class Role(str, Enum):
    ADMIN = "admin"
    USER = "user"
    TRAINER = "trainer"

class TrainingType(str, Enum):
    STRENGTH = "strength"
    CARDIO = "cardio"
    FLEXIBILITY = "flexibility"
    HIIT = "hiit"
    CUSTOM = "custom"

class AssessmentType(str, Enum):
    INITIAL = "initial"
    PROGRESS = "progress"
    FINAL = "final"

# Mensagens
class MessageBase(BaseModel):
    """Esquema base para mensagens"""
    content: str

class MessageCreate(MessageBase):
    """Esquema para criação de mensagens"""
    receiver_id: str

class MessageResponse(MessageBase):
    """Esquema para resposta de mensagens"""
    id: str
    sender_id: str
    receiver_id: str
    created_at: datetime
    is_read: bool

    class Config:
        orm_mode = True

# Treinos
class ExerciseBase(BaseModel):
    """Esquema base para exercícios"""
    name: str
    sets: int
    reps: int
    weight: Optional[float] = None
    rest: Optional[int] = None  # em segundos
    notes: Optional[str] = None

class TrainingBase(BaseModel):
    """Esquema base para treinos"""
    title: str
    description: Optional[str] = None
    type: TrainingType
    exercises: List[ExerciseBase]

class TrainingCreate(TrainingBase):
    """Esquema para criação de treinos"""
    user_id: str

class TrainingResponse(TrainingBase):
    """Esquema para resposta de treinos"""
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Avaliações
class MeasurementBase(BaseModel):
    """Esquema base para medidas"""
    weight: Optional[float] = None  # em kg
    height: Optional[float] = None  # em cm
    body_fat: Optional[float] = None  # em %
    muscle_mass: Optional[float] = None  # em kg
    bmi: Optional[float] = None  # Índice de Massa Corporal
    waist: Optional[float] = None  # em cm
    hip: Optional[float] = None  # em cm
    chest: Optional[float] = None  # em cm
    arms: Optional[float] = None  # em cm
    legs: Optional[float] = None  # em cm

class AssessmentBase(BaseModel):
    """Esquema base para avaliações"""
    type: AssessmentType
    date: datetime
    measurements: MeasurementBase
    notes: Optional[str] = None

class AssessmentCreate(AssessmentBase):
    """Esquema para criação de avaliações"""
    user_id: str

class AssessmentResponse(AssessmentBase):
    """Esquema para resposta de avaliações"""
    id: str
    user_id: str
    created_at: datetime

    class Config:
        orm_mode = True

# Progresso
class ProgressEntryBase(BaseModel):
    """Esquema base para entradas de progresso"""
    date: datetime
    weight: Optional[float] = None
    notes: Optional[str] = None
    photos: Optional[List[str]] = None

class ProgressEntryCreate(ProgressEntryBase):
    """Esquema para criação de entradas de progresso"""
    user_id: str

class ProgressEntryResponse(ProgressEntryBase):
    """Esquema para resposta de entradas de progresso"""
    id: str
    user_id: str
    created_at: datetime

    class Config:
        orm_mode = True

# Pagamentos
class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentBase(BaseModel):
    """Esquema base para pagamentos"""
    amount: float
    description: str
    status: PaymentStatus

class PaymentCreate(PaymentBase):
    """Esquema para criação de pagamentos"""
    user_id: str

class PaymentResponse(PaymentBase):
    """Esquema para resposta de pagamentos"""
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Conteúdo
class ContentType(str, Enum):
    ARTICLE = "article"
    VIDEO = "video"
    RECIPE = "recipe"
    WORKOUT = "workout"

class ContentBase(BaseModel):
    """Esquema base para conteúdo"""
    title: str
    type: ContentType
    description: str
    content: str
    thumbnail_url: Optional[str] = None
    tags: Optional[List[str]] = None

class ContentCreate(ContentBase):
    """Esquema para criação de conteúdo"""
    author_id: str

class ContentResponse(ContentBase):
    """Esquema para resposta de conteúdo"""
    id: str
    author_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Respostas genéricas
class SuccessResponse(BaseModel):
    """Esquema para respostas de sucesso"""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

class ErrorResponse(BaseModel):
    """Esquema para respostas de erro"""
    success: bool = False
    error: str
    details: Optional[Dict[str, Any]] = None

# Perfil de usuário
class PerfilResponse(BaseModel):
    """Esquema para resposta de perfil"""
    id: str
    user_id: str
    nome: Optional[str] = None
    email: str
    telefone: Optional[str] = None
    objetivo: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

