# Comentário sobre storage removido - agora usa storage local
import os
from sqlalchemy.orm import Session
from .database import get_db, SessionLocal
from .models import Usuario, Cliente, TreinoEnviado, Evento
from typing import Optional, List
import uuid
from datetime import datetime

class DatabaseClient:
    """Cliente para operações de banco de dados PostgreSQL"""
    
    def __init__(self):
        self.db = SessionLocal()
    
    def close(self):
        """Fecha a conexão com o banco"""
        self.db.close()
    
    # Operações de Usuário
    def create_user(self, user_data: dict) -> dict:
        """Cria um novo usuário"""
        user = Usuario(**user_data)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return self._user_to_dict(user)
    
    def get_user_by_email(self, email: str) -> Optional[dict]:
        """Busca usuário por email"""
        user = self.db.query(Usuario).filter(Usuario.email == email).first()
        return self._user_to_dict(user) if user else None
    
    def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """Busca usuário por ID"""
        user = self.db.query(Usuario).filter(Usuario.id == user_id).first()
        return self._user_to_dict(user) if user else None
    
    def update_user(self, email: str, updates: dict) -> dict:
        """Atualiza dados do usuário"""
        user = self.db.query(Usuario).filter(Usuario.email == email).first()
        if not user:
            raise ValueError(f"Usuário com email {email} não encontrado")
        
        for key, value in updates.items():
            if hasattr(user, key):
                setattr(user, key, value)
        
        user.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        return self._user_to_dict(user)
    
    def get_all_users(self) -> List[dict]:
        """Retorna todos os usuários"""
        users = self.db.query(Usuario).all()
        return [self._user_to_dict(user) for user in users]
    
    # Operações de Cliente
    def create_client(self, client_data: dict) -> dict:
        """Cria um novo cliente"""
        client = Cliente(**client_data)
        self.db.add(client)
        self.db.commit()
        self.db.refresh(client)
        return self._client_to_dict(client)
    
    def get_client_by_email(self, email: str) -> Optional[dict]:
        """Busca cliente por email"""
        client = self.db.query(Cliente).filter(Cliente.email == email).first()
        return self._client_to_dict(client) if client else None
    
    # Operações de Treino
    def create_training_record(self, training_data: dict) -> dict:
        """Cria registro de treino enviado"""
        training = TreinoEnviado(**training_data)
        self.db.add(training)
        self.db.commit()
        self.db.refresh(training)
        return self._training_to_dict(training)
    
    # Operações de Evento
    def create_event(self, event_data: dict) -> dict:
        """Cria um novo evento"""
        event = Evento(**event_data)
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return self._event_to_dict(event)
    
    def get_trainings_by_client_email(self, client_email: str) -> List[dict]:
        """Busca treinos enviados para um cliente específico"""
        trainings = self.db.query(TreinoEnviado).filter(
            TreinoEnviado.cliente_email == client_email
        ).order_by(TreinoEnviado.enviado_em.desc()).all()
        
        return [self._training_to_dict(training) for training in trainings]
    
    # Métodos auxiliares para conversão
    def _user_to_dict(self, user: Usuario) -> dict:
        """Converte objeto Usuario para dicionário"""
        return {
            "id": user.id,
            "nome": user.nome,
            "email": user.email,
            "senha_hash": user.senha_hash,
            "endereco": user.endereco,
            "cidade": user.cidade,
            "cep": user.cep,
            "telefone": user.telefone,
            "whatsapp": user.whatsapp,
            "is_admin": user.is_admin,
            "treino_pdf": user.treino_pdf,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None
        }
    
    def _client_to_dict(self, client: Cliente) -> dict:
        """Converte objeto Cliente para dicionário"""
        return {
            "id": client.id,
            "nome": client.nome,
            "email": client.email,
            "telefone": client.telefone,
            "created_at": client.created_at.isoformat() if client.created_at else None
        }
    
    def _training_to_dict(self, training: TreinoEnviado) -> dict:
        """Converte objeto TreinoEnviado para dicionário"""
        return {
            "id": training.id,
            "cliente_email": training.cliente_email,
            "url_pdf": training.url_pdf,
            "nome_arquivo": training.nome_arquivo,
            "enviado_em": training.enviado_em.isoformat() if training.enviado_em else None
        }
    
    def _event_to_dict(self, event: Evento) -> dict:
        """Converte objeto Evento para dicionário"""
        return {
            "id": event.id,
            "email_cliente": event.email_cliente,
            "data": event.data,
            "tipo": event.tipo,
            "status": event.status,
            "created_at": event.created_at.isoformat() if event.created_at else None
        }

# Instância global do cliente
def get_database_client() -> DatabaseClient:
    """Retorna instância do cliente de banco de dados"""
    return DatabaseClient()

