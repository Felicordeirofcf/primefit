import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.core.models import Base  # Certifique-se de que o caminho está correto

# 🔐 Obter URL do banco de dados a partir do ambiente
DATABASE_URL = os.environ.get("postgresql://postgres:wbvzYQGLDimXoqgdbEHAhpbWxnXUmfOi@postgres.railway.internal:5432/railway")

if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL não encontrada nas variáveis de ambiente")

# ⚙️ Criar o engine com boas práticas de pool
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=300
)

# 🛠️ Criar o SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """🔄 Dependency Injection para obter uma sessão de banco"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """📦 Cria todas as tabelas definidas nos modelos"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tabelas criadas com sucesso.")
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")

def drop_tables():
    """🧨 Remove todas as tabelas (⚠️ use com cuidado!)"""
    try:
        Base.metadata.drop_all(bind=engine)
        print("⚠️ Tabelas removidas com sucesso.")
    except Exception as e:
        print(f"❌ Erro ao remover tabelas: {e}")
