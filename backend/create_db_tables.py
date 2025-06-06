from src.core.database import Base, engine
from src.schemas.models import *

def create_db_tables():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")

if __name__ == "__main__":
    create_db_tables()

