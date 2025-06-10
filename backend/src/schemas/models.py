from sqlalchemy import Column, String, DateTime, Integer, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime # Adicionado import para datetime

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
    senha: str # Renomeado de 'password' para 'senha' para corresponder ao frontend
    endereco: str
    cidade: str
    cep: str
    telefone: str
    whatsapp: str
    tipo_usuario: str # Adicionado para corresponder ao frontend

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




class MessageCreate(BaseModel):
    usuario_id: str
    assunto: str
    conteudo: str

class MessageResponse(BaseModel):
    id: str
    usuario_id: str
    assunto: str
    conteudo: str
    enviado_em: datetime

    class Config:
        from_attributes = True




class TreinoCreate(BaseModel):
    usuario_id: str
    nome_arquivo: str
    url_pdf: str

class TreinoResponse(BaseModel):
    id: str
    usuario_id: str
    nome_arquivo: str
    url_pdf: str
    enviado_em: datetime

    class Config:
        from_attributes = True




class AvaliacaoCreate(BaseModel):
    usuario_id: str
    tipo: str
    peso: float
    altura: float
    percentual_gordura: float
    massa_muscular: float

class AvaliacaoResponse(BaseModel):
    id: str
    usuario_id: str
    tipo: str
    data: datetime
    peso: float
    altura: float
    percentual_gordura: float
    massa_muscular: float

    class Config:
        from_attributes = True




class DashboardStats(BaseModel):
    total_usuarios: int
    usuarios_ativos: int
    assinaturas_ativas: int
    receita_mensal: float

    class Config:
        from_attributes = True




class ProgressoCreate(BaseModel):
    usuario_id: str
    peso: float
    altura: float
    percentual_gordura: float
    massa_muscular: float

class ProgressoResponse(BaseModel):
    id: str
    usuario_id: str
    data_medicao: datetime
    peso: float
    altura: float
    percentual_gordura: float
    massa_muscular: float

    class Config:
        from_attributes = True




class Content(Base):
    __tablename__ = "content"

    id = Column(String, primary_key=True)
    title = Column(String)
    summary = Column(String)
    body = Column(String)
    author_id = Column(String)
    category = Column(String)
    tags = Column(String) # Assuming tags are stored as a comma-separated string for simplicity
    image_url = Column(String)
    published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Comment(Base):
    __tablename__ = "comments"

    id = Column(String, primary_key=True)
    content_id = Column(String)
    user_id = Column(String)
    text = Column(String)
    created_at = Column(DateTime, default=func.now())




class ContentCreate(BaseModel):
    title: str
    summary: str
    body: str
    category: str
    tags: List[str]
    image_url: Optional[str] = None
    published: bool = True

    class Config:
        from_attributes = True

class ContentResponse(BaseModel):
    id: str
    title: str
    summary: str
    body: str
    author_id: str
    category: str
    tags: List[str]
    image_url: Optional[str] = None
    published: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    text: str

class CommentResponse(BaseModel):
    id: str
    content_id: str
    user_id: str
    text: str
    created_at: datetime

    class Config:
        from_attributes = True




class PlanCreate(BaseModel):
    name: str
    description: str
    price: float
    duration_months: int
    is_active: Optional[bool] = True

class CadastroSimples(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    whatsapp: str
