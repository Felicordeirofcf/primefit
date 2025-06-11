from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from src.core.database import get_db
from routes.auth import get_current_user
from src.schemas.models import DashboardStats, Profile, TreinoEnviado, Progresso, Mensagem, Assinatura, Avaliacao

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Obtém estatísticas para o dashboard (apenas para admins)
    """
    # Verifica se o usuário tem permissão de administrador
    if current_user.tipo_usuario != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar estatísticas do dashboard"
        )
    
    try:
        # Total de usuários
        total_usuarios = db.query(Profile).count()
        
        # Usuários com assinatura ativa
        usuarios_ativos = db.query(Assinatura).filter(Assinatura.status == "ativa").count()
        
        # Total de assinaturas ativas
        assinaturas_ativas = usuarios_ativos # Assuming 1 active subscription per active user for this stat
        
        # Receita mensal (soma dos valores das assinaturas ativas do mês atual)
        current_month = datetime.now().month
        current_year = datetime.now().year
        
        revenue_data = db.query(Assinatura.valor_pago).filter(
            Assinatura.status == "ativa",
            func.extract("month", Assinatura.data_inicio) == current_month,
            func.extract("year", Assinatura.data_inicio) == current_year
        ).all()
        receita_mensal = sum(float(sub[0] or 0) for sub in revenue_data)
        
        return {
            "total_usuarios": total_usuarios,
            "usuarios_ativos": usuarios_ativos,
            "assinaturas_ativas": assinaturas_ativas,
            "receita_mensal": receita_mensal
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar estatísticas do dashboard: {str(e)}"
        )

@router.get("/user-summary")
async def get_user_summary(current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Obtém resumo do usuário para o dashboard pessoal
    """
    try:
        user_id = current_user.id
        
        # Busca perfil do usuário
        profile = db.query(Profile).filter(Profile.id == user_id).first()
        
        # Conta treinos ativos (assuming 'ativo' column in TreinoEnviado, if not, remove filter)
        total_treinos = db.query(TreinoEnviado).filter(TreinoEnviado.usuario_id == user_id).count()
        
        # Conta entradas de progresso
        total_progresso = db.query(Progresso).filter(Progresso.usuario_id == user_id).count()
        
        # Conta mensagens não lidas (assuming 'lida' column in Mensagem, if not, remove filter)
        mensagens_nao_lidas = db.query(Mensagem).filter(Mensagem.usuario_id == user_id, Mensagem.lida == False).count()
        
        # Busca última entrada de progresso
        ultimo_progresso = db.query(Progresso).filter(Progresso.usuario_id == user_id).order_by(Progresso.data_medicao.desc()).first()
        
        # Busca assinatura ativa
        assinatura_ativa = db.query(Assinatura).filter(Assinatura.usuario_id == user_id, Assinatura.status == "ativa").first()
        
        # Busca avaliações pendentes
        avaliacoes_pendentes = db.query(Avaliacao).filter(Avaliacao.usuario_id == user_id, Avaliacao.status == "pendente").count()
        
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

# Corrigido o Operation ID para evitar duplicação
@router.get("/recent-activity", operation_id="get_dashboard_recent_activity")
async def get_recent_activity(
    limit: int = 10,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtém atividades recentes do usuário
    """
    try:
        user_id = current_user.id
        activities = []
        
        # Treinos recentes
        trainings = db.query(TreinoEnviado).filter(TreinoEnviado.usuario_id == user_id).order_by(TreinoEnviado.enviado_em.desc()).limit(3).all()
        for training in trainings:
            activities.append({
                "type": "treino",
                "title": f"Novo treino: {training.nome_arquivo}",
                "date": training.enviado_em,
                "data": training
            })
        
        # Progresso recente
        progress_entries = db.query(Progresso).filter(Progresso.usuario_id == user_id).order_by(Progresso.data_medicao.desc()).limit(3).all()
        for progress_entry in progress_entries:
            activities.append({
                "type": "progresso",
                "title": f"Progresso registrado em {progress_entry.data_medicao}",
                "date": progress_entry.data_medicao,
                "data": progress_entry
            })
        
        # Mensagens recentes
        messages = db.query(Mensagem).filter(Mensagem.usuario_id == user_id).order_by(Mensagem.enviado_em.desc()).limit(3).all()
        for message in messages:
            activities.append({
                "type": "mensagem",
                "title": f"Nova mensagem: {message.assunto}",
                "date": message.enviado_em,
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
async def get_quick_stats(current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Obtém estatísticas rápidas para cards do dashboard
    """
    try:
        user_id = current_user.id
        
        # Se for admin, retorna estatísticas gerais
        if current_user.tipo_usuario == "admin":
            return await get_admin_quick_stats(db) # Pass db session to admin quick stats
        
        # Para usuários comuns, retorna estatísticas pessoais
        # Progresso: diferença entre primeira e última medição de peso
        progress_entries = db.query(Progresso.peso, Progresso.data_medicao).filter(Progresso.usuario_id == user_id).order_by(Progresso.data_medicao).all()
        
        evolucao_peso = 0
        if progress_entries and len(progress_entries) > 1:
            primeiro = progress_entries[0].peso
            ultimo = progress_entries[-1].peso
            if primeiro is not None and ultimo is not None:
                evolucao_peso = ultimo - primeiro
        
        # Dias desde o cadastro
        profile = db.query(Profile.criado_em).filter(Profile.id == user_id).first()
        dias_cadastrado = 0
        if profile and profile.criado_em:
            cadastro = profile.criado_em
            dias_cadastrado = (datetime.now() - cadastro).days
        
        # Treinos este mês
        inicio_mes = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        treinos_mes = db.query(TreinoEnviado).filter(
            TreinoEnviado.usuario_id == user_id,
            TreinoEnviado.enviado_em >= inicio_mes
        ).count()
        
        return {
            "evolucao_peso": round(evolucao_peso, 1),
            "dias_cadastrado": dias_cadastrado,
            "treinos_mes": treinos_mes,
            "progresso_total": len(progress_entries) if progress_entries else 0
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar estatísticas rápidas: {str(e)}"
        )

async def get_admin_quick_stats(db: Session) -> Dict[str, int]:
    """
    Obtém estatísticas rápidas para administradores
    """
    try:
        # Novos usuários este mês
        inicio_mes = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        novos_usuarios = db.query(Profile).filter(Profile.criado_em >= inicio_mes).count()
        
        # Treinos enviados este mês
        treinos_enviados = db.query(TreinoEnviado).filter(TreinoEnviado.enviado_em >= inicio_mes).count()
        
        # Mensagens não respondidas (assuming 'respondida' column in Mensagem, if not, remove filter)
        mensagens_pendentes = db.query(Mensagem).filter(Mensagem.respondida == False).count()
        
        # Avaliações pendentes
        avaliacoes_pendentes = db.query(Avaliacao).filter(Avaliacao.status == "pendente").count()
        
        return {
            "novos_usuarios": novos_usuarios,
            "treinos_enviados": treinos_enviados,
            "mensagens_pendentes": mensagens_pendentes,
            "avaliacoes_pendentes": avaliacoes_pendentes
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar estatísticas rápidas do admin: {str(e)}"
        )
