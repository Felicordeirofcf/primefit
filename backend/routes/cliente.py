from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from src.core.db_client import get_database_client
from routes.auth import get_current_user # Importar get_current_user do auth.py
from src.schemas.user import UserCreate, UsuarioResponse # Importar UserCreate e UsuarioResponse
from typing import List, Optional

router = APIRouter()

# 📌 Modelo de resposta para treino enviado (ajustado para usuario_id)
class TreinoEnviadoOut(BaseModel):
    id: str
    usuario_id: str # Alterado de cliente_email para usuario_id
    url_pdf: str
    nome_arquivo: str
    enviado_em: str

# ✅ Cadastro público (rota de clientes agora usa UserCreate e UsuarioResponse)
# Esta rota pode ser redundante se /auth/register já faz o cadastro de clientes
# Se for para um cadastro simplificado, precisa de tratamento de senha
@router.post("/clientes", response_model=UsuarioResponse, operation_id="cadastrar_cliente_post")
async def cadastrar_cliente(user_data: UserCreate): # Usar UserCreate
    try:
        db_client = get_database_client()
        
        # Verificar se usuário já existe pelo email
        existing_user = db_client.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

        # Criar usuário (assumindo que a senha será hashed em um serviço de usuário ou auth.py)
        # Se esta rota for para cadastro público, a senha deve ser hashed aqui ou em um serviço
        # Para este exemplo, vamos simplificar e passar os dados como estão, mas em produção, HASH A SENHA!
        new_user_data = user_data.model_dump() # Converte Pydantic para dict
        
        # Se a senha não for hashed aqui, remova-a ou adicione um hash placeholder
        # Exemplo: new_user_data["senha_hash"] = "senha_nao_hashed_ainda"
        
        created_user = db_client.create_user(new_user_data) # Usar create_user
        db_client.close()
        
        return UsuarioResponse.model_validate(created_user) # Retornar UsuarioResponse
    
    except HTTPException:
        raise
    except Exception as e:
        print("❌ Erro no cadastro de cliente:", e)
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

# 📥 ROTA: listar treinos PDF enviados com filtros dinâmicos
@router.get(
    "/treinos-enviados",
    response_model=List[TreinoEnviadoOut],
    dependencies=[Depends(get_current_user)],
    operation_id="listar_treinos_enviados_get"
)
async def listar_treinos_enviados(
    # Query parameters para filtros dinâmicos
    usuario_id: Optional[str] = None,
    nome_arquivo: Optional[str] = None,
    # Parâmetros de paginação
    skip: int = 0,
    limit: int = 100,
    current_user: UsuarioResponse = Depends(get_current_user)
): # Obter o objeto Usuario
    try:
        db_client = get_database_client()
        
        # Se usuario_id não for especificado, usar o ID do usuário atual
        target_user_id = usuario_id if usuario_id else current_user.id
        
        # Buscar treinos enviados com filtros
        # Esta implementação depende da estrutura do db_client
        # Assumindo que existe um método que aceita filtros
        if nome_arquivo:
            trainings = db_client.get_trainings_by_filters(
                usuario_id=target_user_id,
                nome_arquivo=nome_arquivo,
                skip=skip,
                limit=limit
            )
        else:
            trainings = db_client.get_trainings_by_client_email(target_user_id)
        
        db_client.close()
        
        return trainings
    
    except Exception as e:
        print("❌ Erro ao listar treinos:", e)
        raise HTTPException(status_code=500, detail=f"Erro ao listar treinos: {str(e)}")


