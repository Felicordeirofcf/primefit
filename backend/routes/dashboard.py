from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import logging

from src.core.database import get_db
from routes.auth import get_current_user
from src.schemas.models import Usuario, TreinoEnviado, Progresso, Mensagem, Assinatura, Avaliacao
from pydantic import BaseModel, Field

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# ---------------------------
# 📦 MODELOS Pydantic para serialização (compatível com Pydantic V2)
# ---------------------------

class DashboardStats(BaseModel):
    total_usuarios: int
    usuarios_ativos: int
    assinaturas_ativas: int
    receita_mensal: float

class ActivityItem(BaseModel):
    type: str
    title: str
    date: datetime
    data: Dict[str, Any]

class QuickStats(BaseModel):
    evolucao_peso: float = 0.0
    dias_cadastrado: int = 0
    treinos_mes: int = 0
    progresso_total: int = 0

class AdminQuickStats(BaseModel):
    novos_usuarios: int = 0
    treinos_enviados: int = 0
    mensagens_pendentes: int = 0
    avaliacoes_pendentes: int = 0

class UserSummary(BaseModel):
    profile: Dict[str, Any]
    total_treinos: int = 0
    total_progresso: int = 0
    mensagens_nao_lidas: int = 0
    ultimo_progresso: Optional[Dict[str, Any]] = None
    assinatura_ativa: Optional[Dict[str, Any]] = None
    avaliacoes_pendentes: int = 0

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Obtém estatísticas para o dashboard (apenas para admins)
    """
    try:
        # Verificação de permissão mais flexível para testes
        is_admin = getattr(current_user, "is_admin", False) or getattr(current_user, "tipo_usuario", "") == "admin"
        
        if not is_admin:
            logger.warning(f"Acesso negado: usuário {current_user.id} não é admin")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para acessar estatísticas do dashboard"
            )
        
        # Total de usuários
        total_usuarios = db.query(Usuario).count()
        
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
        
        # Tratamento seguro para valores nulos
        receita_mensal = 0.0
        for item in revenue_data:
            if item[0] is not None:
                try:
                    receita_mensal += float(item[0])
                except (ValueError, TypeError):
                    logger.warning(f"Valor não numérico encontrado: {item[0]}")
        
        return {
            "total_usuarios": total_usuarios,
            "usuarios_ativos": usuarios_ativos,
            "assinaturas_ativas": assinaturas_ativas,
            "receita_mensal": receita_mensal
        }
    except Exception as e:
        logger.error(f"Erro ao buscar estatísticas do dashboard: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar estatísticas do dashboard: {str(e)}"
        )

@router.get("/user-summary", response_model=UserSummary)
async def get_user_summary(current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Obtém resumo do usuário para o dashboard pessoal
    """
    try:
        user_id = current_user.id
        logger.info(f"Obtendo resumo para usuário: {user_id}")
        
        # Busca perfil do usuário
        profile = db.query(Usuario).filter(Usuario.id == user_id).first()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Perfil não encontrado"
            )
        
        # Serializa o perfil para evitar problemas
        profile_dict = {
            "id": str(profile.id),
            "nome": profile.nome,
            "email": profile.email,
            "tipo_usuario": profile.tipo_usuario,
            "created_at": profile.created_at,
            "updated_at": profile.updated_at,
            "endereco": getattr(profile, "endereco", None),
            "cidade": getattr(profile, "cidade", None),
            "cep": getattr(profile, "cep", None),
            "telefone": getattr(profile, "telefone", None),
            "whatsapp": getattr(profile, "whatsapp", None),
            "is_admin": getattr(profile, "is_admin", False),
            "role": getattr(profile, "role", profile.tipo_usuario)
        }
        
        # Conta treinos ativos
        total_treinos = db.query(TreinoEnviado).filter(TreinoEnviado.usuario_id == user_id).count()
        
        # Conta entradas de progresso
        total_progresso = db.query(Progresso).filter(Progresso.usuario_id == user_id).count()
        
        # Conta mensagens não lidas
        try:
            mensagens_nao_lidas = db.query(Mensagem).filter(
                Mensagem.usuario_id == user_id, 
                Mensagem.lida == False
            ).count()
        except Exception as e:
            logger.warning(f"Erro ao contar mensagens não lidas: {str(e)}")
            mensagens_nao_lidas = 0
        
        # Busca última entrada de progresso
        ultimo_progresso = db.query(Progresso).filter(
            Progresso.usuario_id == user_id
        ).order_by(Progresso.data_medicao.desc()).first()
        
        ultimo_progresso_dict = None
        if ultimo_progresso:
            # Serializa o objeto para evitar problemas
            ultimo_progresso_dict = {
                "id": str(ultimo_progresso.id),
                "usuario_id": str(ultimo_progresso.usuario_id),
                "data_medicao": ultimo_progresso.data_medicao,
                "peso": ultimo_progresso.peso,
                # Adicione outros campos conforme necessário
            }
        
        # Busca assinatura ativa
        assinatura_ativa = db.query(Assinatura).filter(
            Assinatura.usuario_id == user_id, 
            Assinatura.status == "ativa"
        ).first()
        
        assinatura_ativa_dict = None
        if assinatura_ativa:
            # Serializa o objeto para evitar problemas
            assinatura_ativa_dict = {
                "id": str(assinatura_ativa.id),
                "usuario_id": str(assinatura_ativa.usuario_id),
                "status": assinatura_ativa.status,
                "data_inicio": assinatura_ativa.data_inicio,
                "data_fim": assinatura_ativa.data_fim,
                "valor_pago": assinatura_ativa.valor_pago,
                # Adicione outros campos conforme necessário
            }
        
        # Busca avaliações pendentes
        try:
            avaliacoes_pendentes = db.query(Avaliacao).filter(
                Avaliacao.usuario_id == user_id, 
                Avaliacao.status == "pendente"
            ).count()
        except Exception as e:
            logger.warning(f"Erro ao contar avaliações pendentes: {str(e)}")
            avaliacoes_pendentes = 0
        
        return {
            "profile": profile_dict,
            "total_treinos": total_treinos,
            "total_progresso": total_progresso,
            "mensagens_nao_lidas": mensagens_nao_lidas,
            "ultimo_progresso": ultimo_progresso_dict,
            "assinatura_ativa": assinatura_ativa_dict,
            "avaliacoes_pendentes": avaliacoes_pendentes
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar resumo do usuário: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar resumo do usuário: {str(e)}"
        )

# Corrigido o Operation ID para evitar duplicação
@router.get("/recent-activity", operation_id="get_dashboard_recent_activity", response_model=List[ActivityItem])
async def get_recent_activity(
    limit: int = 10,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtém atividades recentes do usuário
    """
    try:
        user_id = current_user.id
        logger.info(f"Obtendo atividades recentes para usuário: {user_id}")
        activities = []
        
        # Treinos recentes
        try:
            trainings = db.query(TreinoEnviado).filter(
                TreinoEnviado.usuario_id == user_id
            ).order_by(TreinoEnviado.enviado_em.desc()).limit(3).all()
            
            for training in trainings:
                # Serializa o objeto para evitar problemas
                training_dict = {
                    "id": str(training.id),
                    "usuario_id": str(training.usuario_id),
                    "nome_arquivo": training.nome_arquivo,
                    "enviado_em": training.enviado_em,
                    # Adicione outros campos conforme necessário
                }
                
                activities.append({
                    "type": "treino",
                    "title": f"Novo treino: {training.nome_arquivo}",
                    "date": training.enviado_em,
                    "data": training_dict
                })
        except Exception as e:
            logger.warning(f"Erro ao buscar treinos recentes: {str(e)}")
        
        # Progresso recente
        try:
            progress_entries = db.query(Progresso).filter(
                Progresso.usuario_id == user_id
            ).order_by(Progresso.data_medicao.desc()).limit(3).all()
            
            for progress_entry in progress_entries:
                # Serializa o objeto para evitar problemas
                progress_dict = {
                    "id": str(progress_entry.id),
                    "usuario_id": str(progress_entry.usuario_id),
                    "data_medicao": progress_entry.data_medicao,
                    "peso": progress_entry.peso,
                    # Adicione outros campos conforme necessário
                }
                
                activities.append({
                    "type": "progresso",
                    "title": f"Progresso registrado em {progress_entry.data_medicao}",
                    "date": progress_entry.data_medicao,
                    "data": progress_dict
                })
        except Exception as e:
            logger.warning(f"Erro ao buscar progresso recente: {str(e)}")
        
        # Mensagens recentes
        try:
            messages = db.query(Mensagem).filter(
                Mensagem.usuario_id == user_id
            ).order_by(Mensagem.enviado_em.desc()).limit(3).all()
            
            for message in messages:
                # Serializa o objeto para evitar problemas
                message_dict = {
                    "id": str(message.id),
                    "usuario_id": str(message.usuario_id),
                    "assunto": message.assunto,
                    "enviado_em": message.enviado_em,
                    # Adicione outros campos conforme necessário
                }
                
                activities.append({
                    "type": "mensagem",
                    "title": f"Nova mensagem: {message.assunto}",
                    "date": message.enviado_em,
                    "data": message_dict
                })
        except Exception as e:
            logger.warning(f"Erro ao buscar mensagens recentes: {str(e)}")
        
        # Ordena por data (mais recente primeiro) e limita
        activities.sort(key=lambda x: x["date"], reverse=True)
        return activities[:limit]
    except Exception as e:
        logger.error(f"Erro ao buscar atividades recentes: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar atividades recentes: {str(e)}"
        )

@router.get("/quick-stats", response_model=QuickStats)
async def get_quick_stats(current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Obtém estatísticas rápidas para cards do dashboard
    """
    try:
        user_id = current_user.id
        logger.info(f"Obtendo estatísticas rápidas para usuário: {user_id}")
        
        # Se for admin, retorna estatísticas gerais
        is_admin = getattr(current_user, "is_admin", False) or getattr(current_user, "tipo_usuario", "") == "admin"
        if is_admin:
            admin_stats = await get_admin_quick_stats(db)
            # Converte para o formato esperado
            return QuickStats(
                evolucao_peso=0.0,
                dias_cadastrado=0,
                treinos_mes=admin_stats.get("treinos_enviados", 0),
                progresso_total=admin_stats.get("novos_usuarios", 0)
            )
        
        # Para usuários comuns, retorna estatísticas pessoais
        # Progresso: diferença entre primeira e última medição de peso
        try:
            progress_entries = db.query(Progresso.peso, Progresso.data_medicao).filter(
                Progresso.usuario_id == user_id
            ).order_by(Progresso.data_medicao).all()
            
            evolucao_peso = 0.0
            if progress_entries and len(progress_entries) > 1:
                primeiro = progress_entries[0].peso
                ultimo = progress_entries[-1].peso
                if primeiro is not None and ultimo is not None:
                    try:
                        evolucao_peso = float(ultimo) - float(primeiro)
                    except (ValueError, TypeError):
                        logger.warning(f"Erro ao calcular evolução de peso: primeiro={primeiro}, ultimo={ultimo}")
        except Exception as e:
            logger.warning(f"Erro ao buscar progresso: {str(e)}")
            evolucao_peso = 0.0
            progress_entries = []
        
        # Dias desde o cadastro
        try:
            profile = db.query(Usuario.created_at).filter(Usuario.id == user_id).first()
            dias_cadastrado = 0
            if profile and profile.created_at:
                cadastro = profile.created_at
                dias_cadastrado = (datetime.now() - cadastro).days
        except Exception as e:
            logger.warning(f"Erro ao calcular dias desde cadastro: {str(e)}")
            dias_cadastrado = 0
        
        # Treinos este mês
        try:
            inicio_mes = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            treinos_mes = db.query(TreinoEnviado).filter(
                TreinoEnviado.usuario_id == user_id,
                TreinoEnviado.enviado_em >= inicio_mes
            ).count()
        except Exception as e:
            logger.warning(f"Erro ao contar treinos do mês: {str(e)}")
            treinos_mes = 0
        
        return {
            "evolucao_peso": round(evolucao_peso, 1),
            "dias_cadastrado": dias_cadastrado,
            "treinos_mes": treinos_mes,
            "progresso_total": len(progress_entries) if progress_entries else 0
        }
    except Exception as e:
        logger.error(f"Erro ao buscar estatísticas rápidas: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar estatísticas rápidas: {str(e)}"
        )

async def get_admin_quick_stats(db: Session):
    """
    Função auxiliar para obter estatísticas rápidas para admins.
    """
    try:
        novos_usuarios = db.query(Usuario).filter(Usuario.created_at >= (datetime.now() - timedelta(days=30))).count()
        treinos_enviados = db.query(TreinoEnviado).filter(TreinoEnviado.enviado_em >= (datetime.now() - timedelta(days=30))).count()
        mensagens_pendentes = db.query(Mensagem).filter(Mensagem.lida == False).count()
        avaliacoes_pendentes = db.query(Avaliacao).filter(Avaliacao.status == "pendente").count()

        return {
            "novos_usuarios": novos_usuarios,
            "treinos_enviados": treinos_enviados,
            "mensagens_pendentes": mensagens_pendentes,
            "avaliacoes_pendentes": avaliacoes_pendentes
        }
    except Exception as e:
        logger.error(f"Erro ao buscar estatísticas rápidas do admin: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar estatísticas rápidas do admin: {str(e)}"
        )


