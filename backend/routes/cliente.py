from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from src.core.db_client import get_database_client
from auth import get_current_user
from typing import List

router = APIRouter()

# 📌 Modelo de cadastro de cliente
class Cliente(BaseModel):
    nome: str
    email: EmailStr
    telefone: str

# 📌 Modelo de resposta para treino enviado
class TreinoEnviadoOut(BaseModel):
    id: str
    cliente_email: str
    url_pdf: str
    nome_arquivo: str
    enviado_em: str

# ✅ Cadastro público
@router.post("/clientes")
async def cadastrar_cliente(data: Cliente):
    try:
        db_client = get_database_client()
        
        # Verificar se cliente já existe
        existing_client = db_client.get_client_by_email(data.email)
        if existing_client:
            raise HTTPException(status_code=400, detail="Cliente já cadastrado")

        # Criar cliente
        client_data = {
            "nome": data.nome,
            "email": data.email,
            "telefone": data.telefone
        }
        
        db_client.create_client(client_data)
        db_client.close()
        
        return {"message": "Cadastro realizado com sucesso!"}
    
    except HTTPException:
        raise
    except Exception as e:
        print("❌ Erro no cadastro:", e)
        raise HTTPException(status_code=500, detail="Erro interno.")

# 📥 NOVA ROTA: listar treinos PDF enviados para o cliente autenticado
@router.get("/treinos-enviados", response_model=List[TreinoEnviadoOut], dependencies=[Depends(get_current_user)])
async def listar_treinos_enviados(user_email: str = Depends(get_current_user)):
    try:
        db_client = get_database_client()
        
        # Buscar treinos enviados para o usuário
        trainings = db_client.get_trainings_by_client_email(user_email)
        db_client.close()
        
        return trainings
    
    except Exception as e:
        print("❌ Erro ao listar treinos:", e)
        raise HTTPException(status_code=500, detail=f"Erro ao listar treinos: {str(e)}")
