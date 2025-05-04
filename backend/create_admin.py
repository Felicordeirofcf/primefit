# create_admin.py

from pydantic import BaseModel, EmailStr
from supabase import create_client
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

# Carregar variáveis de ambiente
load_dotenv()

# Configurar Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("❌ SUPABASE_URL ou SUPABASE_KEY não configuradas")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Gerar hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dados do administrador
admin_email = "admin@prime.com"
admin_senha = "123456"

# Verificar se já existe
check = supabase.table("usuarios").select("id").eq("email", admin_email).execute()
if check.data:
    print("⚠️ Admin já existe.")
else:
    hashed = pwd_context.hash(admin_senha)

    novo_admin = {
        "nome": "Administrador",
        "email": admin_email,
        "senha": hashed,
        "endereco": "Admin Street",
        "cidade": "Adminville",
        "cep": "00000-000",
        "telefone": "000000000",
        "whatsapp": "000000000",
        "plano": "admin",
        "status_plano": "ativo",
        "treino_pdf": None,
        "link_app": None
    }

    result = supabase.table("usuarios").insert(novo_admin).execute()
    print("✅ Admin criado com sucesso!")
