from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from src.core.supabase_client import supabase
from src.api.endpoints.auth import get_current_user
from src.schemas.assessment import Assessment, AssessmentCreate, AssessmentResponse

router = APIRouter()

@router.post("/", response_model=AssessmentResponse)
async def create_assessment(
    assessment: AssessmentCreate,
    current_user: dict = Depends(get_current_user)
):
    # Apenas administradores e personal trainers podem criar avaliações
    if current_user["role"] not in ["admin", "trainer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para criar avaliações"
        )
    
    try:
        # Prepara dados para inserção
        assessment_data = assessment.dict()
        assessment_data["trainer_id"] = current_user["id"]  # Define o avaliador como o usuário atual
        
        # Calcula o IMC se altura e peso estiverem disponíveis
        if assessment.height and assessment.weight:
            height_m = assessment.height / 100  # Converte cm para m
            assessment_data["bmi"] = round(assessment.weight / (height_m * height_m), 2)
        
        # Insere avaliação no Supabase
        response = supabase.table("assessments").insert(assessment_data).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar avaliação"
            )
        
        # Busca a avaliação anterior para calcular mudanças
        return await enrich_assessment_data(response.data[0])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar avaliação: {str(e)}"
        )

@router.get("/", response_model=List[AssessmentResponse])
async def get_assessments(
    user_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Define o user_id para filtro
        filter_user_id = user_id if user_id else current_user["id"]
        
        # Usuários comuns só podem ver suas próprias avaliações
        if current_user["role"] == "client" and current_user["id"] != filter_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para acessar avaliações de outros usuários"
            )
        
        # Monta a query
        query = supabase.table("assessments").select("*").eq("user_id", filter_user_id)
        
        # Ordena por data decrescente
        query = query.order("date", desc=True)
        
        response = query.execute()
        
        if not response.data:
            return []
        
        # Enriquece os dados de cada avaliação
        assessments = []
        for assessment_data in response.data:
            enriched_assessment = await enrich_assessment_data(assessment_data)
            assessments.append(enriched_assessment)
        
        return assessments
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar avaliações: {str(e)}"
        )

@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(
    assessment_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Busca a avaliação
        response = supabase.table("assessments").select("*").eq("id", assessment_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )
        
        assessment_data = response.data[0]
        
        # Verifica permissões
        if current_user["role"] == "client" and current_user["id"] != assessment_data["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para acessar esta avaliação"
            )
        
        # Enriquece os dados da avaliação
        return await enrich_assessment_data(assessment_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar avaliação: {str(e)}"
        )

@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assessment(
    assessment_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Apenas administradores e personal trainers podem excluir avaliações
    if current_user["role"] not in ["admin", "trainer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para excluir avaliações"
        )
    
    try:
        # Verifica se a avaliação existe
        response = supabase.table("assessments").select("*").eq("id", assessment_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )
        
        # Exclui avaliação do Supabase
        supabase.table("assessments").delete().eq("id", assessment_id).execute()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir avaliação: {str(e)}"
        )

# Função auxiliar para enriquecer os dados da avaliação
async def enrich_assessment_data(assessment_data: dict) -> dict:
    try:
        # Calcula a relação cintura-quadril se disponível
        if assessment_data.get("waist") and assessment_data.get("hip") and assessment_data["hip"] > 0:
            assessment_data["waist_hip_ratio"] = round(assessment_data["waist"] / assessment_data["hip"], 2)
        else:
            assessment_data["waist_hip_ratio"] = None
        
        # Busca a avaliação anterior para calcular mudanças de peso
        user_id = assessment_data["user_id"]
        current_date = assessment_data["date"]
        
        previous_assessment_response = supabase.table("assessments") \
            .select("weight") \
            .eq("user_id", user_id) \
            .lt("date", current_date) \
            .order("date", desc=True) \
            .limit(1) \
            .execute()
        
        if previous_assessment_response.data and len(previous_assessment_response.data) > 0:
            previous_weight = previous_assessment_response.data[0]["weight"]
            assessment_data["previous_weight"] = previous_weight
            
            # Calcula mudança de peso
            weight_change = assessment_data["weight"] - previous_weight
            assessment_data["weight_change"] = round(weight_change, 2)
            
            # Calcula percentual de mudança
            if previous_weight > 0:
                weight_change_percentage = (weight_change / previous_weight) * 100
                assessment_data["weight_change_percentage"] = round(weight_change_percentage, 2)
            else:
                assessment_data["weight_change_percentage"] = None
        else:
            assessment_data["previous_weight"] = None
            assessment_data["weight_change"] = None
            assessment_data["weight_change_percentage"] = None
        
        return assessment_data
    except Exception as e:
        print(f"Erro ao enriquecer dados da avaliação: {e}")
        # Retorna os dados originais se houver erro
        return assessment_data
