from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer, Float
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

class Usuario(Base):
    """Modelo para usuários do sistema (clientes e admins)"""
    __tablename__ = "usuarios"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    senha_hash = Column(String, nullable=False)
    endereco = Column(String)
    cidade = Column(String)
    cep = Column(String)
    telefone = Column(String)
    whatsapp = Column(String)
    is_admin = Column(Boolean, default=False)
    treino_pdf = Column(String)  # URL do PDF de treino
    tipo_usuario = Column(String, default="client")  # <-- ADICIONE ESTA LINHA
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Cliente(Base):
    """Modelo para clientes (pode ser redundante com Usuario, mas mantendo por compatibilidade)"""
    __tablename__ = "clientes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    telefone = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class TreinoEnviado(Base):
    """Modelo para treinos enviados aos clientes"""
    __tablename__ = "treinos_enviados"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    cliente_email = Column(String, nullable=False)
    url_pdf = Column(String, nullable=False)
    nome_arquivo = Column(String, nullable=False)
    enviado_em = Column(DateTime, default=datetime.utcnow)

class Evento(Base):
    """Modelo para eventos/agendamentos"""
    __tablename__ = "eventos"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email_cliente = Column(String, nullable=False)
    data = Column(String, nullable=False)  # formato ISO yyyy-mm-dd
    tipo = Column(String, default="agendamento")
    status = Column(String, default="agendado")
    created_at = Column(DateTime, default=datetime.utcnow)

# Modelos adicionais baseados na estrutura da API
class Profile(Base):
    """Perfis de usuário"""
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    bio = Column(Text)
    avatar_url = Column(String)
    preferences = Column(Text)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Message(Base):
    """Mensagens do sistema"""
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id = Column(String, nullable=False)
    recipient_id = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    message_type = Column(String, default="text")
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Training(Base):
    """Treinos"""
    __tablename__ = "trainings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    exercises = Column(Text)  # JSON string
    duration = Column(Integer)  # em minutos
    difficulty = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Assessment(Base):
    """Avaliações"""
    __tablename__ = "assessments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    weight = Column(Float)
    height = Column(Float)
    body_fat = Column(Float)
    muscle_mass = Column(Float)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Progress(Base):
    """Progresso do usuário"""
    __tablename__ = "progress"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    metric_type = Column(String, nullable=False)  # weight, strength, endurance, etc.
    value = Column(Float, nullable=False)
    unit = Column(String)
    notes = Column(Text)
    recorded_at = Column(DateTime, default=datetime.utcnow)

class Payment(Base):
    """Pagamentos"""
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="BRL")
    status = Column(String, default="pending")
    payment_method = Column(String)
    transaction_id = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Content(Base):
    """Conteúdo do sistema"""
    __tablename__ = "content"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    content_type = Column(String, nullable=False)  # article, video, exercise, etc.
    content = Column(Text)
    author_id = Column(String)
    published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

