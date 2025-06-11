from sqlalchemy.orm import Session
from src.core.database import SessionLocal
from src.schemas.models import Profile  # ajuste se seu model estiver em outro lugar

def set_admin(email: str):
    db: Session = SessionLocal()
    user = db.query(Profile).filter(Profile.email == email).first()

    if user:
        user.is_admin = True
        db.commit()
        print(f"✅ Usuário {user.nome} ({user.email}) agora é admin.")
    else:
        print("❌ Usuário não encontrado.")

if __name__ == "__main__":
    set_admin("feliipefcf@gmail.com")
