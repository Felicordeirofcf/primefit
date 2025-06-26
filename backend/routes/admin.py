from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from src.core.database import get_db
from routes.auth import get_current_user
from src.schemas.user import UsuarioResponse as UserProfile
from src.core.models import Usuario, TreinoEnviado, Progresso, Avaliacao, Mensagem, Assinatura

router = APIRouter()

@router.get("/stats/overview")
async def get_admin_overview(current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retorna estatísticas gerais para o painel administrativo
    """
    # Verificar se o usuário é admin
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem acessar este endpoint."
        )
    
    try:
        # Total de usuários
        total_users = db.query(Usuario).count()
        
        # Usuários ativos (logaram nos últimos 30 dias)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        active_users = db.query(Usuario).filter(Usuario.ultimo_login >= thirty_days_ago).count()
        
        # Total de treinos enviados
        total_trainings = db.query(TreinoEnviado).count()
        
        # Total de registros de progresso
        total_progress = db.query(Progresso).count()
        
        # Total de avaliações
        total_assessments = db.query(Avaliacao).count()
        
        # Total de mensagens
        total_messages = db.query(Mensagem).count()
        
        # Assinaturas ativas
        active_subscriptions = db.query(Assinatura).filter(Assinatura.status == 'ativa').count()
        
        # Receita total (soma dos valores pagos das assinaturas ativas)
        revenue_data = db.query(Assinatura.valor_pago).filter(Assinatura.status == 'ativa').all()
        total_revenue = sum(float(sub[0] or 0) for sub in revenue_data)
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "total_trainings": total_trainings,
            "total_progress": total_progress,
            "total_assessments": total_assessments,
            "total_messages": total_messages,
            "active_subscriptions": active_subscriptions,
            "total_revenue": total_revenue,
            "user_growth_rate": round((active_users / total_users * 100) if total_users > 0 else 0, 1)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar estatísticas: {str(e)}"
        )

@router.get("/users")
async def get_all_users(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista todos os usuários com paginação e busca
    """
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem acessar este endpoint."
        )
    
    try:
        # Calcular offset para paginação
        offset = (page - 1) * limit
        
        # Construir query base
        query = db.query(Usuario)
        
        # Aplicar filtro de busca se fornecido
        if search:
            query = query.filter(Usuario.nome.ilike(f'%{search}%') | Usuario.email.ilike(f'%{search}%'))
        
        # Buscar total de registros para paginação
        total_count = query.count()

        # Aplicar paginação e ordenação
        users = query.order_by(Usuario.criado_em.desc()).offset(offset).limit(limit).all()
        
        return {
            "users": users,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_count,
                "pages": (total_count + limit - 1) // limit
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar usuários: {str(e)}"
        )

@router.get("/users/{user_id}/details")
async def get_user_details(
    user_id: str,
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retorna detalhes completos de um usuário específico
    """
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem acessar este endpoint."
        )
    
    try:
        # Buscar dados do usuário
        user = db.query(Usuario).filter(Usuario.id == user_id).first()
        
        # Buscar treinos do usuário
        trainings = db.query(TreinoEnviado).filter(TreinoEnviado.usuario_id == user_id).all()
        
        # Buscar progresso do usuário
        progress = db.query(Progresso).filter(Progresso.usuario_id == user_id).order_by(Progresso.data_medicao.desc()).all()
        
        # Buscar avaliações do usuário
        assessments = db.query(Avaliacao).filter(Avaliacao.usuario_id == user_id).all()
        
        # Buscar mensagens do usuário
        messages = db.query(Mensagem).filter(Mensagem.usuario_id == user_id).order_by(Mensagem.enviado_em.desc()).all()
        
        # Buscar assinaturas do usuário
        subscriptions = db.query(Assinatura).filter(Assinatura.usuario_id == user_id).order_by(Assinatura.data_inicio.desc()).all()
        
        return {
            "user": user,
            "trainings": trainings,
            "progress": progress,
            "assessments": assessments,
            "messages": messages,
            "subscriptions": subscriptions,
            "summary": {
                "total_trainings": len(trainings),
                "total_progress": len(progress),
                "total_assessments": len(assessments),
                "total_messages": len(messages),
                "active_subscription": any(sub.status == 'ativa' for sub in subscriptions)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar detalhes do usuário: {str(e)}"
        )

@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = 50,
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retorna atividades recentes do sistema
    """
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem acessar este endpoint."
        )
    
    try:
        activities = []
        
        # Buscar registros recentes de diferentes tabelas
        
        # Novos usuários
        users = db.query(Usuario).order_by(Usuario.criado_em.desc()).limit(10).all()
        for user in users:
            activities.append({
                "type": "new_user",
                "title": f"Novo usuário: {user.nome or user.email}",
                "description": "Usuário se cadastrou na plataforma",
                "date": user.criado_em,
                "user_id": user.id
            })
        
        # Treinos enviados
        trainings = db.query(TreinoEnviado).order_by(TreinoEnviado.enviado_em.desc()).limit(10).all()
        for training in trainings:
            activities.append({
                "type": "training_sent",
                "title": f"Treino enviado: {training.nome_arquivo}",
                "description": "Novo treino foi enviado para o usuário",
                "date": training.enviado_em,
                "user_id": training.usuario_id
            })
        
        # Progresso registrado
        progress_entries = db.query(Progresso).order_by(Progresso.data_medicao.desc()).limit(10).all()
        for progress_entry in progress_entries:
            activities.append({
                "type": "progress_logged",
                "title": f"Progresso registrado: {progress_entry.peso}kg",
                "description": "Usuário registrou novo progresso",
                "date": progress_entry.data_medicao,
                "user_id": progress_entry.usuario_id
            })
        
        # Mensagens enviadas
        messages = db.query(Mensagem).order_by(Mensagem.enviado_em.desc()).limit(10).all()
        for message in messages:
            activities.append({
                "type": "message_sent",
                "title": f"Mensagem: {message.assunto}",
                "description": "Nova mensagem foi enviada",
                "date": message.enviado_em,
                "user_id": message.usuario_id
            })
        
        # Ordenar todas as atividades por data
        activities.sort(key=lambda x: x['date'], reverse=True)
        
        # Limitar ao número solicitado
        return activities[:limit]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar atividades recentes: {str(e)}"
        )

@router.get("/analytics/users")
async def get_user_analytics(current_user: UserProfile = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retorna análises de usuários para gráficos
    """
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem acessar este endpoint."
        )
    
    try:
        # Usuários por mês (últimos 12 meses)
        monthly_users = []
        for i in range(12):
            start_date = (datetime.now() - timedelta(days=30 * (i + 1))).replace(day=1)
            end_date = (datetime.now() - timedelta(days=30 * i)).replace(day=1)
            
            count = db.query(Profile).filter(
                Profile.criado_em >= start_date,
                Profile.criado_em < end_date
            ).count()
            
            monthly_users.append({
                "month": start_date.strftime("%Y-%m"),
                "count": count
            })
        
        monthly_users.reverse()
        
        # Distribuição por planos
        plan_distribution_query = db.query(Assinatura.plano_id, func.count(Assinatura.plano_id)).filter(Assinatura.status == 'ativa').group_by(Assinatura.plano_id).all()
        
        plan_distribution = {plan_id: count for plan_id, count in plan_distribution_query}
        
        return {
            "monthly_users": monthly_users,
            "plan_distribution": [
                {"label": "Série Única", "value": plan_distribution.get('serie_unica', 0)},
                {"label": "Consultoria Completa", "value": plan_distribution.get('consultoria_completa', 0)}
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar análises de usuários: {str(e)}"
        )

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Atualiza o papel de um usuário
    """
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem acessar este endpoint."
        )
    
    if role not in ['client', 'admin', 'trainer']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Papel inválido. Use: client, admin ou trainer"
        )
    
    try:
        user = db.query(Usuario).filter(Usuario.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        user.role = role
        db.commit()
        db.refresh(user)
        
        return {"message": "Papel do usuário atualizado com sucesso", "user": user}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar papel do usuário: {str(e)}"
        )


