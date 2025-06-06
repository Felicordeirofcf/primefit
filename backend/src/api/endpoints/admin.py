from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timedelta
from src.core.supabase_client import get_supabase_client
from src.api.endpoints.auth import get_current_user
from src.schemas.models import PerfilResponse as UserProfile

router = APIRouter()

@router.get("/stats/overview")
async def get_admin_overview(current_user: UserProfile = Depends(get_current_user)):
    """
    Retorna estatísticas gerais para o painel administrativo
    """
    # Verificar se o usuário é admin
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem acessar este endpoint."
        )
    
    supabase = get_supabase_client()
    
    try:
        # Total de usuários
        users_response = supabase.table('profiles').select('id', count='exact').execute()
        total_users = users_response.count or 0
        
        # Usuários ativos (logaram nos últimos 30 dias)
        thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
        active_users_response = supabase.table('profiles').select('id', count='exact').gte('ultimo_login', thirty_days_ago).execute()
        active_users = active_users_response.count or 0
        
        # Total de treinos enviados
        trainings_response = supabase.table('treinos_enviados').select('id', count='exact').execute()
        total_trainings = trainings_response.count or 0
        
        # Total de registros de progresso
        progress_response = supabase.table('progresso').select('id', count='exact').execute()
        total_progress = progress_response.count or 0
        
        # Total de avaliações
        assessments_response = supabase.table('avaliacoes').select('id', count='exact').execute()
        total_assessments = assessments_response.count or 0
        
        # Total de mensagens
        messages_response = supabase.table('mensagens').select('id', count='exact').execute()
        total_messages = messages_response.count or 0
        
        # Assinaturas ativas
        active_subscriptions_response = supabase.table('assinaturas').select('id', count='exact').eq('status', 'ativa').execute()
        active_subscriptions = active_subscriptions_response.count or 0
        
        # Receita total (soma dos valores pagos das assinaturas ativas)
        revenue_response = supabase.table('assinaturas').select('valor_pago').eq('status', 'ativa').execute()
        total_revenue = sum(float(sub['valor_pago'] or 0) for sub in revenue_response.data)
        
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
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Lista todos os usuários com paginação e busca
    """
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem acessar este endpoint."
        )
    
    supabase = get_supabase_client()
    
    try:
        # Calcular offset para paginação
        offset = (page - 1) * limit
        
        # Construir query base
        query = supabase.table('profiles').select('*')
        
        # Aplicar filtro de busca se fornecido
        if search:
            query = query.or_(f'nome.ilike.%{search}%,email.ilike.%{search}%')
        
        # Aplicar paginação e ordenação
        response = query.order('criado_em', desc=True).range(offset, offset + limit - 1).execute()
        
        # Buscar total de registros para paginação
        count_query = supabase.table('profiles').select('id', count='exact')
        if search:
            count_query = count_query.or_(f'nome.ilike.%{search}%,email.ilike.%{search}%')
        
        count_response = count_query.execute()
        total_count = count_response.count or 0
        
        return {
            "users": response.data,
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
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Retorna detalhes completos de um usuário específico
    """
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem acessar este endpoint."
        )
    
    supabase = get_supabase_client()
    
    try:
        # Buscar dados do usuário
        user_response = supabase.table('profiles').select('*').eq('id', user_id).single().execute()
        
        if not user_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        # Buscar treinos do usuário
        trainings_response = supabase.table('treinos_enviados').select('*').eq('usuario_id', user_id).execute()
        
        # Buscar progresso do usuário
        progress_response = supabase.table('progresso').select('*').eq('usuario_id', user_id).order('data_medicao', desc=True).execute()
        
        # Buscar avaliações do usuário
        assessments_response = supabase.table('avaliacoes').select('*').eq('usuario_id', user_id).execute()
        
        # Buscar mensagens do usuário
        messages_response = supabase.table('mensagens').select('*').eq('usuario_id', user_id).order('enviado_em', desc=True).execute()
        
        # Buscar assinaturas do usuário
        subscriptions_response = supabase.table('assinaturas').select('*').eq('usuario_id', user_id).order('data_inicio', desc=True).execute()
        
        return {
            "user": user_response.data,
            "trainings": trainings_response.data,
            "progress": progress_response.data,
            "assessments": assessments_response.data,
            "messages": messages_response.data,
            "subscriptions": subscriptions_response.data,
            "summary": {
                "total_trainings": len(trainings_response.data),
                "total_progress": len(progress_response.data),
                "total_assessments": len(assessments_response.data),
                "total_messages": len(messages_response.data),
                "active_subscription": any(sub['status'] == 'ativa' for sub in subscriptions_response.data)
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
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Retorna atividades recentes do sistema
    """
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem acessar este endpoint."
        )
    
    supabase = get_supabase_client()
    
    try:
        activities = []
        
        # Buscar registros recentes de diferentes tabelas
        
        # Novos usuários
        users_response = supabase.table('profiles').select('id, nome, email, criado_em').order('criado_em', desc=True).limit(10).execute()
        for user in users_response.data:
            activities.append({
                "type": "new_user",
                "title": f"Novo usuário: {user['nome'] or user['email']}",
                "description": "Usuário se cadastrou na plataforma",
                "date": user['criado_em'],
                "user_id": user['id']
            })
        
        # Treinos enviados
        trainings_response = supabase.table('treinos_enviados').select('id, nome_arquivo, enviado_em, usuario_id').order('enviado_em', desc=True).limit(10).execute()
        for training in trainings_response.data:
            activities.append({
                "type": "training_sent",
                "title": f"Treino enviado: {training['nome_arquivo']}",
                "description": "Novo treino foi enviado para o usuário",
                "date": training['enviado_em'],
                "user_id": training['usuario_id']
            })
        
        # Progresso registrado
        progress_response = supabase.table('progresso').select('id, peso, data_medicao, usuario_id').order('data_medicao', desc=True).limit(10).execute()
        for progress in progress_response.data:
            activities.append({
                "type": "progress_logged",
                "title": f"Progresso registrado: {progress['peso']}kg",
                "description": "Usuário registrou novo progresso",
                "date": progress['data_medicao'],
                "user_id": progress['usuario_id']
            })
        
        # Mensagens enviadas
        messages_response = supabase.table('mensagens').select('id, assunto, enviado_em, usuario_id').order('enviado_em', desc=True).limit(10).execute()
        for message in messages_response.data:
            activities.append({
                "type": "message_sent",
                "title": f"Mensagem: {message['assunto']}",
                "description": "Nova mensagem foi enviada",
                "date": message['enviado_em'],
                "user_id": message['usuario_id']
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
async def get_user_analytics(current_user: UserProfile = Depends(get_current_user)):
    """
    Retorna análises de usuários para gráficos
    """
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem acessar este endpoint."
        )
    
    supabase = get_supabase_client()
    
    try:
        # Usuários por mês (últimos 12 meses)
        monthly_users = []
        for i in range(12):
            start_date = (datetime.now() - timedelta(days=30 * (i + 1))).replace(day=1)
            end_date = (datetime.now() - timedelta(days=30 * i)).replace(day=1)
            
            response = supabase.table('profiles').select('id', count='exact').gte('criado_em', start_date.isoformat()).lt('criado_em', end_date.isoformat()).execute()
            
            monthly_users.append({
                "month": start_date.strftime("%Y-%m"),
                "count": response.count or 0
            })
        
        monthly_users.reverse()
        
        # Distribuição por planos
        plans_response = supabase.table('assinaturas').select('plano_id', count='exact').eq('status', 'ativa').execute()
        
        plan_distribution = {}
        for plan in plans_response.data:
            plan_id = plan['plano_id']
            if plan_id in plan_distribution:
                plan_distribution[plan_id] += 1
            else:
                plan_distribution[plan_id] = 1
        
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
    current_user: UserProfile = Depends(get_current_user)
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
    
    supabase = get_supabase_client()
    
    try:
        response = supabase.table('profiles').update({'role': role}).eq('id', user_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        return {"message": "Papel do usuário atualizado com sucesso", "user": response.data[0]}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar papel do usuário: {str(e)}"
        )

