from sqlalchemy import Column, String, DateTime, Integer, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from pydantic import BaseModel, EmailStr
from typing import Optional

Base = declarative_base()

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True)
    nome = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String) # Added password_hash field
    role = Column(String, default="client")
    criado_em = Column(DateTime, default=func.now())
    ultimo_login = Column(DateTime, default=func.now())

class TreinoEnviado(Base):
    __tablename__ = "treinos_enviados"

    id = Column(String, primary_key=True)
    usuario_id = Column(String)
    nome_arquivo = Column(String)
    url_pdf = Column(String)
    enviado_em = Column(DateTime, default=func.now())

class Progresso(Base):
    __tablename__ = "progresso"

    id = Column(String, primary_key=True)
    usuario_id = Column(String)
    data_medicao = Column(DateTime, default=func.now())
    peso = Column(Float)
    altura = Column(Float)
    percentual_gordura = Column(Float)
    massa_muscular = Column(Float)

class Avaliacao(Base):
    __tablename__ = "avaliacoes"

    id = Column(String, primary_key=True)
    usuario_id = Column(String)
    tipo = Column(String)
    data = Column(DateTime, default=func.now())
    peso = Column(Float)
    altura = Column(Float)
    percentual_gordura = Column(Float)
    massa_muscular = Column(Float)

class Mensagem(Base):
    __tablename__ = "mensagens"

    id = Column(String, primary_key=True)
    usuario_id = Column(String)
    assunto = Column(String)
    conteudo = Column(String)
    enviado_em = Column(DateTime, default=func.now())

class Assinatura(Base):
    __tablename__ = "assinaturas"

    id = Column(String, primary_key=True)
    usuario_id = Column(String)
    plano_id = Column(String)
    status = Column(String)
    data_inicio = Column(DateTime)
    data_fim = Column(DateTime)
    valor_pago = Column(Float)

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True)
    user_id = Column(String)
    payment_method = Column(String)
    amount = Column(Float)
    transaction_id = Column(String)
    status = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Plan(Base):
    __tablename__ = "plans"

    id = Column(String, primary_key=True)
    name = Column(String)
    description = Column(String)
    price = Column(Float)
    duration_months = Column(Integer)
    is_active = Column(Boolean, default=True)

# Pydantic Models
class PerfilResponse(BaseModel):
    id: str
    nome: Optional[str] = None
    email: EmailStr
    role: str
    criado_em: datetime
    ultimo_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class Cadastro(BaseModel):
    nome: str
    email: EmailStr
    telefone: Optional[str] = None
    password: str # Added password to Cadastro for registration

class PaymentCreate(BaseModel):
    user_id: str
    payment_method: str
    amount: float

class PaymentResponse(BaseModel):
    id: str
    user_id: str
    payment_method: str
    amount: float
    transaction_id: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PlanResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    duration_months: int
    is_active: bool

    class Config:
        from_attributes = True

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


