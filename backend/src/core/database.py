from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# URL de conexão com o banco de dados PostgreSQL
# Ex: postgresql://user:password@host:port/dbname
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://user:password@host:5432/dbname")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

