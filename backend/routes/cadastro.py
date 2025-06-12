from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from src.core.db_client import get_database_client
from src.schemas.user import UserCreate, UsuarioResponse, RoleEnum
from src.core.auth_utils import get_password_hash
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/clientes", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def cadastrar_cliente(user_data: UserCreate):
    """
    📥 Rota pública para captação de leads/clientes.
    Salva no PostgreSQL se o e-mail ainda não estiver cadastrado.
    """
    try:
        db_client = get_database_client()

        existing_user = db_client.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

        hashed_password = get_password_hash(user_data.senha)

        user_data_dict = user_data.model_dump()
        user_data_dict["senha_hash"] = hashed_password
        del user_data_dict["senha"]

        user_data_dict["id"] = str(uuid.uuid4())
        user_data_dict["created_at"] = datetime.now()
        user_data_dict["updated_at"] = datetime.now()
        user_data_dict["is_admin"] = (user_data.role == RoleEnum.admin)

        created_user = db_client.create_user(user_data_dict)
        db_client.close()

        return UsuarioResponse.model_validate(created_user)

    except HTTPException:
        raise
    except Exception as e:
        print("❌ Erro no cadastro:", e)
        raise HTTPException(status_code=500, detail=f"Erro inesperado: {str(e)}")
