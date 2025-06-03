from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from src.core.supabase_client import supabase
from src.api.endpoints.auth import get_current_user
from src.schemas.training import Exercise, Training, TrainingPlan, TrainingLog

router = APIRouter()

# Rotas para exercícios
@router.post("/exercises", response_model=Exercise)
async def create_exercise(
    exercise: Exercise,
    current_user: dict = Depends(get_current_user)
):
    # Apenas administradores e personal trainers podem criar exercícios
    if current_user["role"] not in ["admin", "trainer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para criar exercícios"
        )
    
    try:
        # Prepara dados para inserção
        exercise_data = exercise.dict(exclude={"id"})
        
        # Insere exercício no Supabase
        response = supabase.table("exercises").insert(exercise_data).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar exercício"
            )
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar exercício: {str(e)}"
        )

@router.get("/exercises", response_model=List[Exercise])
async def get_exercises(
    muscle_group: Optional[str] = None,
    equipment: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        query = supabase.table("exercises").select("*")
        
        # Aplica filtros se fornecidos
        if muscle_group:
            query = query.eq("muscle_group", muscle_group)
        
        if equipment:
            query = query.eq("equipment", equipment)
        
        response = query.execute()
        
        if not response.data:
            return []
        
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar exercícios: {str(e)}"
        )

@router.get("/exercises/{exercise_id}", response_model=Exercise)
async def get_exercise(
    exercise_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        response = supabase.table("exercises").select("*").eq("id", exercise_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exercício não encontrado"
            )
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar exercício: {str(e)}"
        )

# Rotas para planos de treino
@router.post("/plans", response_model=TrainingPlan)
async def create_training_plan(
    training_plan: TrainingPlan,
    current_user: dict = Depends(get_current_user)
):
    # Apenas administradores e personal trainers podem criar planos de treino
    if current_user["role"] not in ["admin", "trainer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para criar planos de treino"
        )
    
    try:
        # Prepara dados para inserção
        plan_data = training_plan.dict(exclude={"id", "trainings"})
        plan_data["created_by"] = current_user["id"]  # Define o criador como o usuário atual
        
        # Insere plano de treino no Supabase
        response = supabase.table("training_plans").insert(plan_data).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar plano de treino"
            )
        
        plan_id = response.data[0]["id"]
        
        # Insere treinos associados ao plano
        for training in training_plan.trainings:
            training_data = training.dict(exclude={"id", "exercise_sets"})
            training_data["plan_id"] = plan_id
            
            training_response = supabase.table("trainings").insert(training_data).execute()
            
            if not training_response.data or len(training_response.data) == 0:
                # Rollback: exclui o plano se houver erro ao inserir treinos
                supabase.table("training_plans").delete().eq("id", plan_id).execute()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Erro ao criar treinos do plano"
                )
            
            training_id = training_response.data[0]["id"]
            
            # Insere séries de exercícios associadas ao treino
            for exercise_set in training.exercise_sets:
                set_data = exercise_set.dict()
                set_data["training_id"] = training_id
                
                set_response = supabase.table("exercise_sets").insert(set_data).execute()
                
                if not set_response.data or len(set_response.data) == 0:
                    # Rollback: exclui o treino e o plano se houver erro ao inserir séries
                    supabase.table("trainings").delete().eq("id", training_id).execute()
                    supabase.table("training_plans").delete().eq("id", plan_id).execute()
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Erro ao criar séries de exercícios"
                    )
        
        # Busca o plano completo com treinos e séries
        return await get_training_plan(plan_id, current_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar plano de treino: {str(e)}"
        )

@router.get("/plans", response_model=List[TrainingPlan])
async def get_training_plans(
    user_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Se um user_id for fornecido, verifica permissões
        if user_id:
            # Usuários comuns só podem ver seus próprios planos
            if current_user["role"] == "client" and current_user["id"] != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Sem permissão para acessar planos de outros usuários"
                )
            
            query = supabase.table("training_plans").select("*").eq("user_id", user_id)
        else:
            # Sem user_id, retorna todos os planos (apenas para admin/trainer)
            if current_user["role"] == "client":
                # Clientes só veem seus próprios planos
                query = supabase.table("training_plans").select("*").eq("user_id", current_user["id"])
            else:
                # Admin/trainer veem todos ou filtram por created_by
                query = supabase.table("training_plans").select("*")
                if current_user["role"] == "trainer":
                    query = query.eq("created_by", current_user["id"])
        
        response = query.execute()
        
        if not response.data:
            return []
        
        # Para cada plano, busca os treinos e séries associados
        plans = []
        for plan_data in response.data:
            plan = await get_training_plan(plan_data["id"], current_user)
            plans.append(plan)
        
        return plans
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar planos de treino: {str(e)}"
        )

@router.get("/plans/{plan_id}", response_model=TrainingPlan)
async def get_training_plan(
    plan_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Busca o plano
        plan_response = supabase.table("training_plans").select("*").eq("id", plan_id).execute()
        
        if not plan_response.data or len(plan_response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plano de treino não encontrado"
            )
        
        plan_data = plan_response.data[0]
        
        # Verifica permissões
        if current_user["role"] == "client" and current_user["id"] != plan_data["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para acessar este plano de treino"
            )
        
        # Busca os treinos associados ao plano
        trainings_response = supabase.table("trainings").select("*").eq("plan_id", plan_id).execute()
        trainings = trainings_response.data or []
        
        # Para cada treino, busca as séries de exercícios
        for training in trainings:
            sets_response = supabase.table("exercise_sets").select("*").eq("training_id", training["id"]).execute()
            training["exercise_sets"] = sets_response.data or []
        
        # Monta o objeto completo
        plan_data["trainings"] = trainings
        
        return plan_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar plano de treino: {str(e)}"
        )

# Rotas para registro de treinos realizados
@router.post("/logs", response_model=TrainingLog)
async def log_training(
    training_log: TrainingLog,
    current_user: dict = Depends(get_current_user)
):
    # Usuários só podem registrar seus próprios treinos
    if current_user["id"] != training_log.user_id and current_user["role"] not in ["admin", "trainer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para registrar treinos de outros usuários"
        )
    
    try:
        # Prepara dados para inserção
        log_data = training_log.dict(exclude={"id"})
        
        # Insere registro de treino no Supabase
        response = supabase.table("training_logs").insert(log_data).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao registrar treino"
            )
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao registrar treino: {str(e)}"
        )

@router.get("/logs", response_model=List[TrainingLog])
async def get_training_logs(
    user_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Define o user_id para filtro
        filter_user_id = user_id if user_id else current_user["id"]
        
        # Usuários comuns só podem ver seus próprios registros
        if current_user["role"] == "client" and current_user["id"] != filter_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para acessar registros de outros usuários"
            )
        
        # Monta a query
        query = supabase.table("training_logs").select("*").eq("user_id", filter_user_id)
        
        # Aplica filtros de data se fornecidos
        if start_date:
            query = query.gte("date", start_date)
        
        if end_date:
            query = query.lte("date", end_date)
        
        # Ordena por data decrescente
        query = query.order("date", desc=True)
        
        response = query.execute()
        
        if not response.data:
            return []
        
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar registros de treino: {str(e)}"
        )
