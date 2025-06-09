# create_admin.py - Migrado para PostgreSQL

from pydantic import BaseModel, EmailStr
from src.core.db_client import get_database_client
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

# Carregar variáveis de ambiente
load_dotenv()

# Gerar hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dados do administrador
admin_email = "admin@primefit.com"
admin_senha = "admin123"

def main():
    try:
        db_client = get_database_client()
        
        # Verificar se já existe
        existing_admin = db_client.get_user_by_email(admin_email)
        if existing_admin:
            print("⚠️ Admin já existe.")
            return

        hashed = pwd_context.hash(admin_senha)

        novo_admin = {
            "nome": "Administrador",
            "email": admin_email,
            "senha_hash": hashed,
            "endereco": "Admin Street",
            "cidade": "Adminville",
            "cep": "00000-000",
            "telefone": "000000000",
            "whatsapp": "000000000",
            "is_admin": True,
            "treino_pdf": None
        }

        result = db_client.create_user(novo_admin)
        db_client.close()
        
        print("✅ Admin criado com sucesso!")
        print(f"Email: {admin_email}")
        print(f"Senha: {admin_senha}")
        
    except Exception as e:
        print(f"❌ Erro ao criar admin: {e}")

if __name__ == "__main__":
    main()
