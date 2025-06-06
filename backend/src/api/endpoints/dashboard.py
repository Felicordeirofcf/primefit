from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any

from src.core.supabase_client import get_supabase_client
supabase = get_supabase_client()
from src.api.endpoints.auth import get_current_user
from src.schemas.models import DashboardStats

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Obtém estatísticas para o dashboard (apenas para admins)"""
    # Verifica se o usuário tem permissão de administrador
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar estatísticas do dashboard"
        )
    
    try:
        # Chama a função do Supabase para obter estatísticas
        response = supabase.rpc("get_dashboard_stats").execute()
        
        if response.data:
            return response.data
        else:
            # Fallback: calcula estatísticas manualmente
            return await calculate_stats_manually()
    except Exception as e:
        # Fallback em caso de erro
        return await calculate_stats_manually()

async def calculate_stats_manually():
    """Calcula estatísticas manualmente como fallback"""
    try:
        # Total de usuários
        users_response = supabase.table("profiles").select("id", count="exact").execute()
        total_usuarios = users_response.count if users_response.count else 0
        
        # Usuários com assinatura ativa
        active_subs_response = supabase.table("assinaturas").select("usuario_id", count="exact").eq("status", "ativa").execute()
        usuarios_ativos = active_subs_response.count if active_subs_response.count else 0
        
        # Total de assinaturas ativas
        assinaturas_ativas = usuarios_ativos
        
        # Receita mensal (soma dos valores das assinaturas ativas do mês atual)
        from datetime import datetime
        current_month = datetime.now().month
        current_year = datetime.now().year
        
        revenue_response = supabase.table("assinaturas").select("valor_pago").eq("status", "ativa").execute()
        receita_mensal = 0
        if revenue_response.data:
            for sub in revenue_response.data:
                receita_mensal += float(sub.get("valor_pago", 0))
        
        return {
            "total_usuarios": total_usuarios,
            "usuarios_ativos": usuarios_ativos,
            "assinaturas_ativas": assinaturas_ativas,
            "receita_mensal": receita_mensal
        }
    except Exception as e:
        return {
            "total_usuarios": 0,
            "usuarios_ativos": 0,
            "assinaturas_ativas": 0,
            "receita_mensal": 0.0
        }

@router.get("/user-summary")
async def get_user_summary(current_user: dict = Depends(get_current_user)):
    """Obtém resumo do usuário para o dashboard pessoal"""
    try:
        user_id = current_user["id"]
        
        # Busca perfil do usuário
        profile_response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        profile = profile_response.data[0] if profile_response.data else {}
        
        # Conta treinos ativos
        trainings_response = supabase.table("treinos_enviados").select("id", count="exact").eq("cliente_id", user_id).eq("ativo", True).execute()
        total_treinos = trainings_response.count if trainings_response.count else 0
        
        # Conta entradas de progresso
        progress_response = supabase.table("progresso").select("id", count="exact").eq("usuario_id", user_id).execute()
        total_progresso = progress_response.count if progress_response.count else 0
        
        # Conta mensagens não lidas
        messages_response = supabase.table("mensagens").select("id", count="exact").eq("destinatario_id", user_id).eq("lida", False).execute()
        mensagens_nao_lidas = messages_response.count if messages_response.count else 0
        
        # Busca última entrada de progresso
        last_progress_response = supabase.table("progresso").select("*").eq("usuario_id", user_id).order("data_medicao", desc=True).limit(1).execute()
        ultimo_progresso = last_progress_response.data[0] if last_progress_response.data else None
        
        # Busca assinatura ativa
        subscription_response = supabase.table("assinaturas").select("*").eq("usuario_id", user_id).eq("status", "ativa").execute()
        assinatura_ativa = subscription_response.data[0] if subscription_response.data else None
        
        # Busca avaliações pendentes
        assessments_response = supabase.table("avaliacoes").select("id", count="exact").eq("usuario_id", user_id).eq("status", "pendente").execute()
        avaliacoes_pendentes = assessments_response.count if assessments_response.count else 0
        
        return {
            "profile": profile,
            "total_treinos": total_treinos,
            "total_progresso": total_progresso,
            "mensagens_nao_lidas": mensagens_nao_lidas,
            "ultimo_progresso": ultimo_progresso,
            "assinatura_ativa": assinatura_ativa,
            "avaliacoes_pendentes": avaliacoes_pendentes
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar resumo do usuário: {str(e)}"
        )

@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
):
    """Obtém atividades recentes do usuário"""
    try:
        user_id = current_user["id"]
        activities = []
        
        # Treinos recentes
        trainings_response = supabase.table("treinos_enviados").select("*").eq("cliente_id", user_id).order("enviado_em", desc=True).limit(3).execute()
        if trainings_response.data:
            for training in trainings_response.data:
                activities.append({
                    "type": "treino",
                    "title": f"Novo treino: {training['nome_arquivo']}",
                    "date": training["enviado_em"],
                    "data": training
                })
        
        # Progresso recente
        progress_response = supabase.table("progresso").select("*").eq("usuario_id", user_id).order("data_medicao", desc=True).limit(3).execute()
        if progress_response.data:
            for progress in progress_response.data:
                activities.append({
                    "type": "progresso",
                    "title": f"Progresso registrado em {progress['data_medicao']}",
                    "date": progress["criado_em"],
                    "data": progress
                })
        
        # Mensagens recentes
        messages_response = supabase.table("mensagens").select("*").eq("destinatario_id", user_id).order("data_envio", desc=True).limit(3).execute()
        if messages_response.data:
            for message in messages_response.data:
                activities.append({
                    "type": "mensagem",
                    "title": f"Nova mensagem: {message['assunto']}",
                    "date": message["data_envio"],
                    "data": message
                })
        
        # Ordena por data (mais recente primeiro) e limita
        activities.sort(key=lambda x: x["date"], reverse=True)
        return activities[:limit]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar atividades recentes: {str(e)}"
        )

@router.get("/quick-stats")
async def get_quick_stats(current_user: dict = Depends(get_current_user)):
    """Obtém estatísticas rápidas para cards do dashboard"""
    try:
        user_id = current_user["id"]
        
        # Se for admin, retorna estatísticas gerais
        if current_user.get("role") == "admin":
            return await get_admin_quick_stats()
        
        # Para usuários comuns, retorna estatísticas pessoais
        # Progresso: diferença entre primeira e última medição de peso
        progress_response = supabase.table("progresso").select("peso, data_medicao").eq("usuario_id", user_id).order("data_medicao").execute()
        
        evolucao_peso = 0
        if progress_response.data and len(progress_response.data) > 1:
            primeiro = progress_response.data[0]
            ultimo = progress_response.data[-1]
            if primeiro.get("peso") and ultimo.get("peso"):
                evolucao_peso = ultimo["peso"] - primeiro["peso"]
        
        # Dias desde o cadastro
        profile_response = supabase.table("profiles").select("data_cadastro").eq("id", user_id).execute()
        dias_cadastrado = 0
        if profile_response.data:
            from datetime import datetime
            cadastro = datetime.fromisoformat(profile_response.data[0]["data_cadastro"].replace("Z", "+00:00"))
            dias_cadastrado = (datetime.now(cadastro.tzinfo) - cadastro).days
        
        # Treinos este mês
        from datetime import datetime, timedelta
        inicio_mes = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        trainings_response = supabase.table("treinos_enviados").select("id", count="exact").eq("cliente_id", user_id).gte("enviado_em", inicio_mes.isoformat()).execute()
        treinos_mes = trainings_response.count if trainings_response.count else 0
        
        return {
            "evolucao_peso": round(evolucao_peso, 1),
            "dias_cadastrado": dias_cadastrado,
            "treinos_mes": treinos_mes,
            "progresso_total": len(progress_response.data) if progress_response.data else 0
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar estatísticas rápidas: {str(e)}"
        )

async def get_admin_quick_stats():
    """Obtém estatísticas rápidas para administradores"""
    try:
        # Novos usuários este mês
        from datetime import datetime
        inicio_mes = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_users_response = supabase.table("profiles").select("id", count="exact").gte("data_cadastro", inicio_mes.isoformat()).execute()
        novos_usuarios = new_users_response.count if new_users_response.count else 0
        
        # Treinos enviados este mês
        trainings_response = supabase.table("treinos_enviados").select("id", count="exact").gte("enviado_em", inicio_mes.isoformat()).execute()
        treinos_enviados = trainings_response.count if trainings_response.count else 0
        
        # Mensagens não respondidas
        messages_response = supabase.table("mensagens").select("id", count="exact").eq("respondida", False).execute()
        mensagens_pendentes = messages_response.count if messages_response.count else 0
        
        # Avaliações pendentes
        assessments_response = supabase.table("avaliacoes").select("id", count="exact").eq("status", "pendente").execute()
        avaliacoes_pendentes = assessments_response.count if assessments_response.count else 0
        
        return {
            "novos_usuarios": novos_usuarios,
            "treinos_enviados": treinos_enviados,
            "mensagens_pendentes": mensagens_pendentes,
            "avaliacoes_pendentes": avaliacoes_pendentes
        }
    except Exception as e:
        return {
            "novos_usuarios": 0,
            "treinos_enviados": 0,
            "mensagens_pendentes": 0,
            "avaliacoes_pendentes": 0
        }

