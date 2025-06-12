from sqlalchemy.orm import Session
from .database import get_db, SessionLocal
from .models import Usuario, TreinoEnviado, Event # Corrigido: Evento para Event
from typing import Optional, List
from datetime import datetime
import uuid

class DatabaseClient:
    """Cliente para operações de banco de dados PostgreSQL"""

    def __init__(self):
        self.db = SessionLocal()

    def close(self):
        """Fecha a conexão com o banco"""
        self.db.close()

    # ---------------------------
    # 🧑‍💼 Operações de Usuário
    # ---------------------------
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

    # ---------------------------
    # 🏋️ Treinos
    # ---------------------------
    def create_training_record(self, training_data: dict) -> dict:
        """Cria registro de treino enviado"""
        training = TreinoEnviado(**training_data)
        self.db.add(training)
        self.db.commit()
        self.db.refresh(training)
        return self._training_to_dict(training)

    def get_trainings_by_client_email(self, client_email: str) -> List[dict]:
        """Busca treinos enviados para um cliente específico"""
        # Assumindo que TreinoEnviado tem um campo para o email do cliente
        trainings = self.db.query(TreinoEnviado).filter(
            TreinoEnviado.usuario_id == client_email # Alterado para usuario_id, assumindo que é o email ou ID do usuário
        ).order_by(TreinoEnviado.enviado_em.desc()).all()
        return [self._training_to_dict(training) for training in trainings]

    # ---------------------------
    # 📅 Eventos
    # ---------------------------
    def create_event(self, event_data: dict) -> dict:
        """Cria um novo evento"""
        event = Event(**event_data) # Corrigido: Evento para Event
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return self._event_to_dict(event)

    # ---------------------------
    # 🔄 Métodos auxiliares
    # ---------------------------
    def _user_to_dict(self, user: Usuario) -> dict:
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
            "updated_at": user.updated_at.isoformat() if user.updated_at else None,
            "role": user.role # Adicionado role
        }

    # Removido _client_to_dict e métodos relacionados a Cliente

    def _training_to_dict(self, training: TreinoEnviado) -> dict:
        return {
            "id": training.id,
            "usuario_id": training.usuario_id, # Alterado para usuario_id
            "url_pdf": training.url_pdf,
            "nome_arquivo": training.nome_arquivo,
            "enviado_em": training.enviado_em.isoformat() if training.enviado_em else None
        }

    def _event_to_dict(self, event: Event) -> dict: # Corrigido: Evento para Event
        return {
            "id": event.id,
            "email_cliente": event.email_cliente,
            "data": event.data,
            "tipo": event.tipo,
            "status": event.status,
            "created_at": event.created_at.isoformat() if event.created_at else None
        }


# ---------------------------
# Instância global do client
# ---------------------------
def get_database_client() -> DatabaseClient:
    return DatabaseClient()


