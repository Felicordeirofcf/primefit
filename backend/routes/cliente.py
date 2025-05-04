from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from supabase_client import supabase  
from auth import get_current_user
from typing import List
from schemas import TreinoEnviadoOut

router = APIRouter()

# 📌 Modelo de cadastro de cliente
class Cliente(BaseModel):
    nome: str
    email: EmailStr
    telefone: str

# ✅ Cadastro público
@router.post("/clientes")
async def cadastrar_cliente(data: Cliente):
    check = supabase.table("clientes").select("id").eq("email", data.email).execute()
    if check.data:
        raise HTTPException(status_code=400, detail="Cliente já cadastrado")

    supabase.table("clientes").insert(data.dict()).execute()
    return {"message": "Cadastro realizado com sucesso!"}

# 📥 NOVA ROTA: listar treinos PDF enviados para o cliente autenticado
@router.get("/treinos-enviados", response_model=List[TreinoEnviadoOut], dependencies=[Depends(get_current_user)])
async def listar_treinos_enviados(user=Depends(get_current_user)):
    try:
        response = (
            supabase.table("treinos_enviados")
            .select("*")
            .eq("cliente_email", user["email"])
            .order("enviado_em", desc=True)
            .execute()
        )
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar treinos: {str(e)}")
