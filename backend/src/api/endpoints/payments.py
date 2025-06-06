from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from src.core.database import get_db
from src.api.endpoints.auth import get_current_user
from src.schemas.models import (
    Payment, PaymentCreate, PaymentResponse,
    PlanCreate, PlanResponse
)
from src.schemas.subscription import SubscriptionCreate, SubscriptionResponse
from src.schemas.models import Plan as SQLAlchemyPlan

# Instancia o roteador
router = APIRouter()

@router.post("/", response_model=PaymentResponse)
async def create_payment(
    payment_data: PaymentCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Usuários só podem criar pagamentos para si mesmos
    if current_user["id"] != payment_data.user_id and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para criar pagamentos para outros usuários"
        )

    try:
        db_payment = Payment(
            **payment_data.dict(),
            status="pending",
            transaction_id=f"sim_{payment_data.payment_method}_{payment_data.amount}",
            created_at=func.now(),
            updated_at=func.now()
        )
        db.add(db_payment)
        db.commit()
        db.refresh(db_payment)

        return db_payment
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar pagamento: {str(e)}"
        )

@router.get("/", response_model=List[PaymentResponse])
async def get_payments(
    user_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
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

        query = db.query(Payment).filter(Payment.user_id == filter_user_id)

        if status_filter:
            query = query.filter(Payment.status == status_filter)

        payments = query.order_by(Payment.created_at.desc()).all()

        return payments
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar pagamentos: {str(e)}"
        )


@router.put("/{payment_id}/complete", response_model=PaymentResponse)
async def complete_payment(
    payment_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Apenas administradores podem marcar pagamentos como concluídos
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para atualizar status de pagamentos"
        )
    
    try:
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pagamento não encontrado"
            )
        
        payment.status = "completed"
        payment.updated_at = func.now()
        db.commit()
        db.refresh(payment)
        
        return payment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar pagamento: {str(e)}"
        )

# Rotas para planos
@router.post("/plans", response_model=PlanResponse)
async def create_plan(
    plan_data: PlanCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Apenas administradores podem criar planos
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para criar planos"
        )
    
    try:
        db_plan = SQLAlchemyPlan(**plan_data.dict())
        db.add(db_plan)
        db.commit()
        db.refresh(db_plan)
        
        return db_plan
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar plano: {str(e)}"
        )

@router.get("/plans", response_model=List[PlanResponse])
async def get_plans(
    is_active: Optional[bool] = True,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(SQLAlchemyPlan)
        
        if is_active is not None:
            query = query.filter(SQLAlchemyPlan.is_active == is_active)
        
        plans = query.all()
        
        return plans
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar planos: {str(e)}"
        )

# Rotas para assinaturas
@router.post("/subscriptions", response_model=SubscriptionResponse)
async def create_subscription(
    subscription_data: SubscriptionCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Usuários só podem criar assinaturas para si mesmos
    if current_user["id"] != subscription_data.usuario_id and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para criar assinaturas para outros usuários"
        )
    
    try:
        db_subscription = Assinatura(**subscription_data.model_dump())
        db.add(db_subscription)
        db.commit()
        db.refresh(db_subscription)
        
        return db_subscription
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar assinatura: {str(e)}"
        )

@router.get("/subscriptions", response_model=List[SubscriptionResponse])
async def get_subscriptions(
    user_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        filter_user_id = user_id if user_id else current_user["id"]
        
        if current_user["role"] == "client" and current_user["id"] != filter_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para acessar assinaturas de outros usuários"
            )
        
        query = db.query(Assinatura).filter(Assinatura.usuario_id == filter_user_id)
        
        if status_filter:
            query = query.filter(Assinatura.status == status_filter)
        
        subscriptions = query.order_by(Assinatura.data_inicio.desc()).all()
        
        return subscriptions
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar assinaturas: {str(e)}"
        )

@router.put("/subscriptions/{subscription_id}/cancel", response_model=SubscriptionResponse)
async def cancel_subscription(
    subscription_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        subscription = db.query(Assinatura).filter(Assinatura.id == subscription_id).first()
        
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assinatura não encontrada"
            )
        
        if current_user["id"] != subscription.usuario_id and current_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para cancelar esta assinatura"
            )
        
        subscription.status = "canceled"
        subscription.auto_renew = False # Assuming auto_renew exists in Assinatura model
        subscription.data_fim = func.now() # Assuming data_fim should be updated on cancel
        db.commit()
        db.refresh(subscription)
        
        return subscription
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao cancelar assinatura: {str(e)}"
        )



