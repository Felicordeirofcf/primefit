from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from src.core.db_client import get_database_client
from src.schemas.user import UserCreate, UsuarioResponse, RoleEnum # Importar UserCreate, UsuarioResponse e RoleEnum
from src.core.auth_utils import get_password_hash # Importar para hash de senha

router = APIRouter()

# 📦 Modelo de dados para cadastro de clientes/leads - Agora usa UserCreate

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
        
        # Hash da senha antes de salvar no banco de dados
        hashed_password = get_password_hash(user_data.senha)
        
        # Criar um dicionário com os dados do usuário, substituindo a senha pela senha hashed
        user_data_dict = user_data.model_dump()
        user_data_dict["senha_hash"] = hashed_password
        del user_data_dict["senha"] # Remover a senha original
        
        # Adicionar o campo 'id' e 'created_at'/'updated_at' se não estiverem no UserCreate
        # Assumindo que o modelo Usuario no banco de dados lida com isso automaticamente ou que o db_client.create_user espera isso
        user_data_dict["id"] = str(uuid.uuid4()) # Adicionar ID
        user_data_dict["created_at"] = datetime.now()
        user_data_dict["updated_at"] = datetime.now()
        
        # Definir is_admin com base na role
        user_data_dict["is_admin"] = (user_data.role == RoleEnum.admin)

        created_user = db_client.create_user(user_data_dict) # Usar create_user
        db_client.close()
        
        return UsuarioResponse.model_validate(created_user) # Retornar UsuarioResponse
    
    except HTTPException:
        raise  # Repassa erro já formatado
    except Exception as e:
        print("❌ Erro no cadastro:", e)
        raise HTTPException(status_code=500, detail=f"Erro inesperado: {str(e)}")


