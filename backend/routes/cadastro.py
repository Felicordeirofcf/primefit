from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from supabase_client import supabase  


router = APIRouter()

# 📦 Modelo de dados para cadastro de clientes/leads
class Cliente(BaseModel):
    nome: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    telefone: str = Field(..., min_length=8)
    whatsapp: str = Field(..., min_length=8)
    endereco: str = Field(..., min_length=3)
    cidade: str = Field(..., min_length=2)
    cep: str = Field(..., min_length=5, max_length=9)

@router.post("/clientes", status_code=status.HTTP_201_CREATED)
async def cadastrar_cliente(data: Cliente):
    """
    📥 Rota pública para captação de leads/clientes.
    Salva no Supabase se o e-mail ainda não estiver cadastrado.
    """
    try:
        # 🔎 Verifica duplicidade por e-mail
        result = supabase.table("clientes").select("id").eq("email", data.email).execute()
        if result.data and len(result.data) > 0:
            raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

        # 📤 Insere novo cliente
        response = supabase.table("clientes").insert(data.dict()).execute()

        if response.error:
            raise HTTPException(status_code=500, detail="Erro ao salvar cliente no Supabase.")

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
        raise HTTPException(status_code=500, detail=f"Erro inesperado: {str(e)}")
