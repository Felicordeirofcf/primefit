# ==============================================================================
# PARTE 1: Exemplo de como seu arquivo principal (ex: main.py) deveria ser
# para incluir o router de assessments e configurar o CORS.
# Você precisará adaptar isso à estrutura do seu projeto.
# ==============================================================================

# main.py (ou seu arquivo principal da aplicação FastAPI)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importe o router de assessments (ajuste o caminho conforme sua estrutura)
# from src.api.endpoints import assessments  # Se 'assessments.py' estiver em src/api/endpoints/
# Ou, se o arquivo que você me deu se chama 'assessments.py' e está em 'src.api.endpoints':
from src.api.endpoints.assessment import router as assessment_router # Supondo que o arquivo seja assessment.py

app = FastAPI(
    title="PrimeFit API",
    description="API para o sistema PrimeFit",
    version="1.0.0"
)

# Configuração do CORS
# Lista de origens permitidas. MUITO IMPORTANTE para produção e desenvolvimento!
origins = [
    "https://www.primefit.com.br",  # Seu frontend em produção
    "http://localhost:3000",       # Exemplo: Frontend rodando localmente (Create React App)
    "http://localhost:5173",       # Exemplo: Frontend rodando localmente (Vite)
    # Adicione outras origens se necessário (ex: outras portas de desenvolvimento)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Permite as origens especificadas
    allow_credentials=True, # Permite cookies/autenticação baseada em token
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], # Métodos HTTP permitidos
    allow_headers=["Authorization", "Content-Type", "X-Client-Info"], # Cabeçalhos HTTP permitidos
)

# Inclui o router de assessments na sua aplicação FastAPI
# Todas as rotas definidas em assessment_router terão o prefixo /assessments
app.include_router(assessment_router, prefix="/assessments", tags=["Assessments"])

# Outros routers e configurações da sua aplicação podem vir aqui
# Exemplo:
# from src.api.endpoints import auth, training_logs, training_plans
# app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
# app.include_router(training_logs.router, prefix="/trainings/logs", tags=["Training Logs"])
# app.include_router(training_plans.router, prefix="/trainings/plans", tags=["Training Plans"])


@app.get("/")
async def read_root():
    return {"message": "Bem-vindo à API PrimeFit!"}

# ==============================================================================
# PARTE 2: Seu arquivo de router de assessments (ex: src/api/endpoints/assessment.py) revisado.
# ==============================================================================

# src/api/endpoints/assessment.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional, Dict, Any
import logging # Para logging de erros

# Presume-se que estas importações estão corretas para sua estrutura de projeto
from src.core.supabase_client import supabase # Cliente Supabase
from src.api.endpoints.auth import get_current_user # Dependência para obter usuário atual
from src.schemas.assessment import Assessment, AssessmentCreate, AssessmentResponse # Seus schemas Pydantic

# Configurar um logger básico para este módulo
logger = logging.getLogger(__name__)

router = APIRouter()

# --- Função Auxiliar para Enriquecer Dados da Avaliação ---
async def enrich_assessment_data(assessment_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Enriquece os dados de uma avaliação com informações adicionais como
    relação cintura-quadril e mudanças de peso em relação à avaliação anterior.
    """
    try:
        # Calcula a relação cintura-quadril se disponível
        waist = assessment_data.get("waist")
        hip = assessment_data.get("hip")
        if waist is not None and hip is not None and hip > 0:
            assessment_data["waist_hip_ratio"] = round(waist / hip, 2)
        else:
            assessment_data["waist_hip_ratio"] = None
        
        # Busca a avaliação anterior para calcular mudanças de peso
        user_id = assessment_data.get("user_id")
        current_date = assessment_data.get("date")
        current_weight = assessment_data.get("weight")

        assessment_data["previous_weight"] = None
        assessment_data["weight_change"] = None
        assessment_data["weight_change_percentage"] = None

        if user_id and current_date and current_weight is not None:
            previous_assessment_response = (
                supabase.table("assessments")
                .select("weight, date") # Selecionar também a data para referência, se necessário
                .eq("user_id", user_id)
                .lt("date", current_date)
                .order("date", desc=True)
                .limit(1)
                .execute()
            )
            
            if previous_assessment_response.data:
                previous_assessment = previous_assessment_response.data[0]
                previous_weight = previous_assessment.get("weight")
                if previous_weight is not None:
                    assessment_data["previous_weight"] = previous_weight
                    weight_change = current_weight - previous_weight
                    assessment_data["weight_change"] = round(weight_change, 2)
                    
                    if previous_weight > 0:
                        weight_change_percentage = (weight_change / previous_weight) * 100
                        assessment_data["weight_change_percentage"] = round(weight_change_percentage, 2)
        
        return assessment_data
    except Exception as e:
        logger.error(f"Erro ao enriquecer dados da avaliação (ID: {assessment_data.get('id')}): {e}", exc_info=True)
        # Retorna os dados originais (ou parcialmente enriquecidos) se houver erro no enriquecimento
        # para não quebrar a resposta principal.
        return assessment_data

# --- Endpoints CRUD para Avaliações ---

@router.post("/", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    assessment: AssessmentCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Cria uma nova avaliação física.
    Apenas administradores e personal trainers podem criar avaliações.
    O ID do trainer é automaticamente definido como o ID do usuário autenticado.
    """
    user_role = current_user.get("role")
    user_id_auth = current_user.get("id")

    if user_role not in ["admin", "trainer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para criar avaliações."
        )
    
    try:
        assessment_data_to_insert = assessment.model_dump() # Usar model_dump() para Pydantic v2+
        assessment_data_to_insert["trainer_id"] = user_id_auth
        
        # Calcula o IMC se altura e peso estiverem disponíveis
        if assessment.height and assessment.weight and assessment.height > 0: # Evitar divisão por zero
            height_m = assessment.height / 100  # Converte cm para m
            assessment_data_to_insert["bmi"] = round(assessment.weight / (height_m * height_m), 2)
        else:
            assessment_data_to_insert.pop("bmi", None) # Remove BMI se não puder ser calculado
        
        response = supabase.table("assessments").insert(assessment_data_to_insert).execute()
        
        if not response.data: # Supabase-py v1 pode não ter erro, mas data vazia
             logger.error(f"Falha ao criar avaliação no Supabase. Resposta: {response}")
             raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro interno ao tentar criar a avaliação no banco de dados."
            )
        
        created_assessment_data = response.data[0]
        # Após criar, enriquecer os dados para o retorno
        return await enrich_assessment_data(created_assessment_data)

    except HTTPException: # Re-raise HTTPExceptions para que o FastAPI as manipule
        raise
    except Exception as e:
        logger.error(f"Erro inesperado ao criar avaliação: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ocorreu um erro inesperado ao criar a avaliação."
        )

@router.get("/", response_model=List[AssessmentResponse])
async def get_assessments(
    user_id: Optional[str] = None, # ID do usuário para o qual buscar avaliações (opcional)
    current_user: dict = Depends(get_current_user)
):
    """
    Lista todas as avaliações.
    - Se `user_id` for fornecido, lista avaliações para esse usuário específico.
      - Clientes só podem ver suas próprias avaliações se `user_id` for de outro.
      - Admins/Trainers podem ver avaliações de qualquer usuário se `user_id` for fornecido.
    - Se `user_id` não for fornecido, clientes veem suas próprias avaliações,
      e admins/trainers podem precisar de uma lógica mais específica (ex: listar todas, ou de seus clientes).
      (Lógica atual: se user_id não fornecido, usa current_user["id"])
    """
    try:
        user_role = current_user.get("role")
        user_id_auth = current_user.get("id")
        
        target_user_id = user_id if user_id else user_id_auth
        
        if user_role == "client" and user_id_auth != target_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para acessar avaliações de outros usuários."
            )
        
        query = supabase.table("assessments").select("*").eq("user_id", target_user_id)
        query = query.order("date", desc=True) # Ordena pela data mais recente primeiro
        
        response = query.execute()
        
        # response.data será uma lista vazia se nada for encontrado, o que é válido.
        # Não é necessário um erro se a lista estiver vazia.
        
        enriched_assessments = []
        if response.data:
            for assessment_item in response.data:
                enriched_assessment = await enrich_assessment_data(assessment_item)
                enriched_assessments.append(enriched_assessment)
        
        return enriched_assessments
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar lista de avaliações: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ocorreu um erro inesperado ao buscar as avaliações."
        )

@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment_by_id( # Renomeado para clareza
    assessment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Obtém uma avaliação específica pelo seu ID.
    Clientes só podem ver suas próprias avaliações.
    Admins/Trainers podem ver qualquer avaliação.
    """
    try:
        response = supabase.table("assessments").select("*").eq("id", assessment_id).maybe_single().execute()
        # Usar maybe_single() é bom pois retorna None se não encontrado, em vez de erro.

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Avaliação com ID '{assessment_id}' não encontrada."
            )
        
        assessment_item_data = response.data # .data já é o dict do item com maybe_single()
        
        user_role = current_user.get("role")
        user_id_auth = current_user.get("id")

        if user_role == "client" and user_id_auth != assessment_item_data.get("user_id"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para acessar esta avaliação."
            )
        
        return await enrich_assessment_data(assessment_item_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar avaliação por ID '{assessment_id}': {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ocorreu um erro inesperado ao buscar a avaliação."
        )

@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assessment(
    assessment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Exclui uma avaliação física.
    Apenas administradores e personal trainers podem excluir avaliações.
    """
    user_role = current_user.get("role")

    if user_role not in ["admin", "trainer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para excluir avaliações."
        )
    
    try:
        # Primeiro, verifica se a avaliação existe para fornecer um 404 adequado
        check_response = supabase.table("assessments").select("id").eq("id", assessment_id).maybe_single().execute()
        
        if not check_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Avaliação com ID '{assessment_id}' não encontrada para exclusão."
            )
        
        # Exclui a avaliação
        # A biblioteca supabase-py pode não retornar erro em delete se o item não existir,
        # mas a verificação acima garante o 404.
        delete_response = supabase.table("assessments").delete().eq("id", assessment_id).execute()

        # Opcional: verificar delete_response se a API do Supabase retornar algo útil sobre a operação
        # if delete_response.error:
        #     logger.error(f"Erro do Supabase ao excluir avaliação '{assessment_id}': {delete_response.error}")
        #     raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Falha ao excluir avaliação no banco de dados.")

        return None # Retorna 204 No Content implicitamente
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao excluir avaliação '{assessment_id}': {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ocorreu um erro inesperado ao excluir a avaliação."
        )

