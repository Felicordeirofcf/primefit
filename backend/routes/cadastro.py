from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from src.core.db_client import get_database_client

router = APIRouter()

# 📦 Modelo de dados para cadastro de clientes/leads
class Cliente(BaseModel):
    nome: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    telefone: str = Field(..., min_length=8)

@router.post("/clientes", status_code=status.HTTP_201_CREATED)
async def cadastrar_cliente(data: Cliente):
    """
    📥 Rota pública para captação de leads/clientes.
    Salva no PostgreSQL se o e-mail ainda não estiver cadastrado.
    """
    try:
        db_client = get_database_client()
        
        # 🔎 Verifica duplicidade por e-mail
        existing_client = db_client.get_client_by_email(data.email)
        if existing_client:
            raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

        # 📤 Insere novo cliente
        client_data = {
            "nome": data.nome,
            "email": data.email,
            "telefone": data.telefone
        }
        
        created_client = db_client.create_client(client_data)
        db_client.close()

        return {
            "message": "Cadastro realizado com sucesso!",
            "cliente": {
                "nome": data.nome,
                "email": data.email
            }
        }

    except HTTPException:
        raise  # Repassa erro já formatado
    except Exception as e:
        print("❌ Erro no cadastro:", e)
        raise HTTPException(status_code=500, detail=f"Erro inesperado: {str(e)}")
