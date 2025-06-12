from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from src.core.db_client import get_database_client
from src.schemas.user import UserCreate, UsuarioResponse, RoleEnum # Importar UserCreate, UsuarioResponse e RoleEnum

router = APIRouter()

# 📦 Modelo de dados para cadastro de clientes/leads - Agora usa UserCreate
# ClienteCreate foi substituído por UserCreate

@router.post("/clientes", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def cadastrar_cliente(user_data: UserCreate):  # Usar user_data do tipo UserCreate
    """
    📥 Rota pública para captação de leads/clientes.
    Salva no PostgreSQL se o e-mail ainda não estiver cadastrado.
    """
    try:
        db_client = get_database_client()
        
        # 🔎 Verifica duplicidade por e-mail
        existing_user = db_client.get_user_by_email(user_data.email) # Usar get_user_by_email
        if existing_user:
            raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

        # 📤 Insere novo usuário com role de cliente
        # user_data já contém todos os campos necessários, incluindo role
        # A senha deve ser hashed antes de ser passada para o banco de dados
        # Para simplificar aqui, vamos assumir que a senha será hashed no auth.py ou em um serviço de usuário
        # Se esta rota for apenas para 

