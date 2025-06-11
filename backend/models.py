from sqlalchemy import Column, String, DateTime
from database import Base
from datetime import datetime
import uuid

# 📦 Modelo SQLAlchemy para salvar uploads no banco
class TreinoEnviado(Base):
    __tablename__ = "treinos_enviados"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    cliente_email = Column(String, nullable=False)
    url_pdf = Column(String, nullable=False)
    nome_arquivo = Column(String, nullable=False)
    enviado_em = Column(DateTime, default=datetime.utcnow)

# (Opcional) Modelo Pydantic para outro endpoint que você tinha
from pydantic import BaseModel, EmailStr

class Cadastro(BaseModel):
    nome: str
    email: EmailStr
    telefone: str = ""
