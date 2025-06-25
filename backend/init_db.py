from dotenv import load_dotenv

load_dotenv()
"""
Script para inicializar o banco de dados PostgreSQL
Cria todas as tabelas necessárias para o PrimeFit
"""

import os
import sys
from pathlib import Path

# Adicionar o diretório src ao path para importar os módulos
sys.path.append(str(Path(__file__).parent / "src"))

from src.core.database import create_tables, engine
from src.core.models import Base
from src.core.db_client import get_database_client
from src.core.auth_utils import get_password_hash

def create_admin_user():
    """Cria um usuário administrador padrão"""
    try:
        db_client = get_database_client()
        
        # Verificar se já existe um admin
        admin_email = "admin@primefit.com"
        existing_admin = db_client.get_user_by_email(admin_email)
        
        if not existing_admin:
            admin_data = {
                "nome": "Administrador",
                "email": admin_email,
                "senha_hash": hash_password("admin123"),
                "endereco": "Endereço Admin",
                "cidade": "Cidade Admin",
                "cep": "00000-000",
                "telefone": "(00) 00000-0000",
                "whatsapp": "(00) 00000-0000",
                "is_admin": True,
                "treino_pdf": None
            }
            
            db_client.create_user(admin_data)
            print("✅ Usuário administrador criado:")
            print(f"   Email: {admin_email}")
            print(f"   Senha: admin123")
        else:
            print("ℹ️  Usuário administrador já existe")
        
        db_client.close()
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário administrador: {e}")

def main():
    """Função principal de inicialização"""
    print("🚀 Inicializando banco de dados PrimeFit...")
    
    try:
        # Criar todas as tabelas
        print("📋 Criando tabelas...")
        create_tables()
        print("✅ Tabelas criadas com sucesso!")
        
        # Criar usuário administrador
        print("👤 Configurando usuário administrador...")
        create_admin_user()
        
        print("\n🎉 Banco de dados inicializado com sucesso!")
        print("\n📝 Próximos passos:")
        print("1. Execute: python main.py")
        print("2. Acesse: http://primefit-production-e300.up.railway.app:8000")
        print("3. Login admin: admin@primefit.com / admin123")
        
    except Exception as e:
        print(f"❌ Erro na inicialização: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

