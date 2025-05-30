# Configuração do cliente Supabase
import os
from supabase import create_client
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# Obtém credenciais do Supabase das variáveis de ambiente
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Verifica se as credenciais estão definidas
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Credenciais do Supabase não encontradas nas variáveis de ambiente")

# Cria e exporta o cliente Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
