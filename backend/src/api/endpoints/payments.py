from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from src.core.supabase_client import supabase
from src.api.endpoints.auth import get_current_user
from src.schemas.payment import Payment, PaymentCreate, Subscription, Plan

router = APIRouter()

# Rotas para pagamentos
@router.post("/", response_model=Payment)
async def create_payment(
    payment: PaymentCreate,
    current_user: dict = Depends(get_current_user)
):
    # Usuários só podem criar pagamentos para si mesmos
    if current_user["id"] != payment.user_id and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para criar pagamentos para outros usuários"
        )
    
    try:
        # Prepara dados para inserção
        payment_data = payment.dict()
        payment_data["status"] = "pending"  # Status inicial
        payment_data["created_at"] = "now()"  # Função SQL para data atual
        
        # Aqui seria integrado com o gateway de pagamento (PagBank)
        # Por simplicidade, estamos apenas simulando
        payment_data["transaction_id"] = f"sim_{payment.payment_method}_{payment.amount}"
        
        # Insere pagamento no Supabase
        response = supabase.table("payments").insert(payment_data).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar pagamento"
            )
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar pagamento: {str(e)}"
        )

@router.get("/", response_model=List[Payment])
async def get_payments(
    user_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Define o user_id para filtro
        filter_user_id = user_id if user_id else current_user["id"]
        
        # Usuários comuns só podem ver seus próprios pagamentos
        if current_user["role"] == "client" and current_user["id"] != filter_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para acessar pagamentos de outros usuários"
            )
        
        # Monta a query
        query = supabase.table("payments").select("*").eq("user_id", filter_user_id)
        
        # Aplica filtro de status se fornecido
        if status:
            query = query.eq("status", status)
        
        # Ordena por data de criação decrescente
        query = query.order("created_at", desc=True)
        
        response = query.execute()
        
        if not response.data:
            return []
        
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar pagamentos: {str(e)}"
        )

@router.put("/{payment_id}/complete", response_model=Payment)
async def complete_payment(
    payment_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Apenas administradores podem marcar pagamentos como concluídos
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para atualizar status de pagamentos"
        )
    
    try:
        # Verifica se o pagamento existe
        response = supabase.table("payments").select("*").eq("id", payment_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pagamento não encontrado"
            )
        
        # Atualiza o status do pagamento
        update_data = {
            "status": "completed",
            "updated_at": "now()"  # Função SQL para data atual
        }
        
        response = supabase.table("payments").update(update_data).eq("id", payment_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao atualizar pagamento"
            )
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar pagamento: {str(e)}"
        )

# Rotas para planos
@router.post("/plans", response_model=Plan)
async def create_plan(
    plan: Plan,
    current_user: dict = Depends(get_current_user)
):
    # Apenas administradores podem criar planos
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para criar planos"
        )
    
    try:
        # Prepara dados para inserção
        plan_data = plan.dict(exclude={"id"})
        
        # Insere plano no Supabase
        response = supabase.table("plans").insert(plan_data).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar plano"
            )
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar plano: {str(e)}"
        )

@router.get("/plans", response_model=List[Plan])
async def get_plans(
    is_active: Optional[bool] = True,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Monta a query
        query = supabase.table("plans").select("*")
        
        # Aplica filtro de status se fornecido
        if is_active is not None:
            query = query.eq("is_active", is_active)
        
        response = query.execute()
        
        if not response.data:
            return []
        
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar planos: {str(e)}"
        )

# Rotas para assinaturas
@router.post("/subscriptions", response_model=Subscription)
async def create_subscription(
    subscription: Subscription,
    current_user: dict = Depends(get_current_user)
):
    # Usuários só podem criar assinaturas para si mesmos
    if current_user["id"] != subscription.user_id and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para criar assinaturas para outros usuários"
        )
    
    try:
        # Prepara dados para inserção
        subscription_data = subscription.dict(exclude={"id"})
        subscription_data["created_at"] = "now()"  # Função SQL para data atual
        
        # Insere assinatura no Supabase
        response = supabase.table("subscriptions").insert(subscription_data).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar assinatura"
            )
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar assinatura: {str(e)}"
        )

@router.get("/subscriptions", response_model=List[Subscription])
async def get_subscriptions(
    user_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Define o user_id para filtro
        filter_user_id = user_id if user_id else current_user["id"]
        
        # Usuários comuns só podem ver suas próprias assinaturas
        if current_user["role"] == "client" and current_user["id"] != filter_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para acessar assinaturas de outros usuários"
            )
        
        # Monta a query
        query = supabase.table("subscriptions").select("*").eq("user_id", filter_user_id)
        
        # Aplica filtro de status se fornecido
        if status:
            query = query.eq("status", status)
        
        # Ordena por data de criação decrescente
        query = query.order("created_at", desc=True)
        
        response = query.execute()
        
        if not response.data:
            return []
        
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar assinaturas: {str(e)}"
        )

@router.put("/subscriptions/{subscription_id}/cancel", response_model=Subscription)
async def cancel_subscription(
    subscription_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Verifica se a assinatura existe
        response = supabase.table("subscriptions").select("*").eq("id", subscription_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assinatura não encontrada"
            )
        
        subscription = response.data[0]
        
        # Verifica permissões
        if current_user["id"] != subscription["user_id"] and current_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para cancelar esta assinatura"
            )
        
        # Atualiza o status da assinatura
        update_data = {
            "status": "canceled",
            "auto_renew": False,
            "updated_at": "now()"  # Função SQL para data atual
        }
        
        response = supabase.table("subscriptions").update(update_data).eq("id", subscription_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao cancelar assinatura"
            )
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao cancelar assinatura: {str(e)}"
        )
