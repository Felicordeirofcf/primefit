from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date
from enum import Enum

# Enums para validação
class GeneroEnum(str, Enum):
    masculino = "masculino"
    feminino = "feminino"
    outro = "outro"

class ObjetivoEnum(str, Enum):
    emagrecimento = "emagrecimento"
    ganho_massa = "ganho_massa"
    performance = "performance"
    bem_estar = "bem_estar"

class NivelAtividadeEnum(str, Enum):
    sedentario = "sedentario"
    leve = "leve"
    moderado = "moderado"
    intenso = "intenso"
    muito_intenso = "muito_intenso"

class PlanoAtivoEnum(str, Enum):
    serie_unica = "serie_unica"
    consultoria_completa = "consultoria_completa"
    inativo = "inativo"

class TipoTreinoEnum(str, Enum):
    forca = "forca"
    cardio = "cardio"
    funcional = "funcional"
    hiit = "hiit"
    yoga = "yoga"
    personalizado = "personalizado"

class StatusAvaliacaoEnum(str, Enum):
    pendente = "pendente"
    em_andamento = "em_andamento"
    concluida = "concluida"
    cancelada = "cancelada"

class PrioridadeMensagemEnum(str, Enum):
    baixa = "baixa"
    normal = "normal"
    alta = "alta"
    urgente = "urgente"

class StatusAssinaturaEnum(str, Enum):
    ativa = "ativa"
    cancelada = "cancelada"
    expirada = "expirada"
    pendente = "pendente"

# Modelos para Perfil de Usuário
class PerfilCreate(BaseModel):
    nome: str
    telefone: Optional[str] = None
    data_nascimento: Optional[date] = None
    genero: Optional[GeneroEnum] = None
    altura: Optional[float] = None  # em metros
    peso_inicial: Optional[float] = None  # em kg
    objetivo: Optional[ObjetivoEnum] = None
    nivel_atividade: Optional[NivelAtividadeEnum] = None

class PerfilUpdate(BaseModel):
    nome: Optional[str] = None
    telefone: Optional[str] = None
    data_nascimento: Optional[date] = None
    genero: Optional[GeneroEnum] = None
    altura: Optional[float] = None
    peso_inicial: Optional[float] = None
    objetivo: Optional[ObjetivoEnum] = None
    nivel_atividade: Optional[NivelAtividadeEnum] = None
    avatar_url: Optional[str] = None
    plano_ativo: Optional[PlanoAtivoEnum] = None

class PerfilResponse(BaseModel):
    id: str
    email: str
    nome: str
    telefone: Optional[str] = None
    data_nascimento: Optional[date] = None
    genero: Optional[str] = None
    altura: Optional[float] = None
    peso_inicial: Optional[float] = None
    objetivo: Optional[str] = None
    nivel_atividade: Optional[str] = None
    avatar_url: Optional[str] = None
    plano_ativo: str
    data_cadastro: datetime
    data_atualizacao: datetime

# Modelos para Treinos
class TreinoCreate(BaseModel):
    cliente_id: str
    nome_arquivo: str
    url_pdf: str
    descricao: Optional[str] = None
    tipo_treino: Optional[TipoTreinoEnum] = None
    duracao_semanas: Optional[int] = 4
    observacoes: Optional[str] = None

class TreinoResponse(BaseModel):
    id: str
    cliente_id: str
    cliente_email: str
    nome_arquivo: str
    url_pdf: str
    descricao: Optional[str] = None
    tipo_treino: Optional[str] = None
    duracao_semanas: int
    observacoes: Optional[str] = None
    enviado_em: datetime
    ativo: bool

# Modelos para Progresso
class ProgressoCreate(BaseModel):
    peso: Optional[float] = None
    percentual_gordura: Optional[float] = None
    massa_muscular: Optional[float] = None
    circunferencia_cintura: Optional[float] = None
    circunferencia_quadril: Optional[float] = None
    circunferencia_braco: Optional[float] = None
    circunferencia_coxa: Optional[float] = None
    pressao_arterial_sistolica: Optional[int] = None
    pressao_arterial_diastolica: Optional[int] = None
    frequencia_cardiaca_repouso: Optional[int] = None
    observacoes: Optional[str] = None
    foto_antes: Optional[str] = None
    foto_depois: Optional[str] = None
    data_medicao: date

class ProgressoResponse(BaseModel):
    id: str
    usuario_id: str
    peso: Optional[float] = None
    percentual_gordura: Optional[float] = None
    massa_muscular: Optional[float] = None
    circunferencia_cintura: Optional[float] = None
    circunferencia_quadril: Optional[float] = None
    circunferencia_braco: Optional[float] = None
    circunferencia_coxa: Optional[float] = None
    pressao_arterial_sistolica: Optional[int] = None
    pressao_arterial_diastolica: Optional[int] = None
    frequencia_cardiaca_repouso: Optional[int] = None
    observacoes: Optional[str] = None
    foto_antes: Optional[str] = None
    foto_depois: Optional[str] = None
    data_medicao: date
    criado_em: datetime

# Modelos para Avaliações
class AvaliacaoCreate(BaseModel):
    tipo_avaliacao: str
    questionario_saude: Optional[dict] = None
    restricoes_medicas: Optional[str] = None
    medicamentos_uso: Optional[str] = None
    lesoes_anteriores: Optional[str] = None
    experiencia_exercicio: Optional[str] = None
    disponibilidade_treino: Optional[int] = None
    local_treino: Optional[str] = None
    equipamentos_disponiveis: Optional[List[str]] = None
    objetivos_especificos: Optional[str] = None
    expectativas: Optional[str] = None
    data_avaliacao: Optional[date] = None

class AvaliacaoResponse(BaseModel):
    id: str
    usuario_id: str
    tipo_avaliacao: str
    questionario_saude: Optional[dict] = None
    restricoes_medicas: Optional[str] = None
    medicamentos_uso: Optional[str] = None
    lesoes_anteriores: Optional[str] = None
    experiencia_exercicio: Optional[str] = None
    disponibilidade_treino: Optional[int] = None
    local_treino: Optional[str] = None
    equipamentos_disponiveis: Optional[List[str]] = None
    objetivos_especificos: Optional[str] = None
    expectativas: Optional[str] = None
    avaliador_id: Optional[str] = None
    status: str
    data_avaliacao: Optional[date] = None
    data_criacao: datetime
    data_atualizacao: datetime

# Modelos para Mensagens
class MensagemCreate(BaseModel):
    destinatario_id: str
    assunto: str
    conteudo: str
    anexos: Optional[List[str]] = None
    prioridade: Optional[PrioridadeMensagemEnum] = PrioridadeMensagemEnum.normal
    categoria: Optional[str] = "geral"

class MensagemResponse(BaseModel):
    id: str
    remetente_id: str
    destinatario_id: str
    assunto: str
    conteudo: str
    anexos: Optional[List[str]] = None
    lida: bool
    respondida: bool
    prioridade: str
    categoria: str
    data_envio: datetime
    data_leitura: Optional[datetime] = None

# Modelos para Planos
class PlanoResponse(BaseModel):
    id: str
    nome: str
    descricao: str
    preco: float
    duracao_dias: int
    recursos: dict
    ativo: bool
    criado_em: datetime

# Modelos para Assinaturas
class AssinaturaCreate(BaseModel):
    plano_id: str
    data_inicio: date
    data_fim: date
    valor_pago: float
    metodo_pagamento: Optional[str] = None
    transaction_id: Optional[str] = None
    renovacao_automatica: Optional[bool] = False

class AssinaturaResponse(BaseModel):
    id: str
    usuario_id: str
    plano_id: str
    status: str
    data_inicio: date
    data_fim: date
    valor_pago: float
    metodo_pagamento: Optional[str] = None
    transaction_id: Optional[str] = None
    renovacao_automatica: bool
    cancelada_em: Optional[datetime] = None
    motivo_cancelamento: Optional[str] = None
    criada_em: datetime
    atualizada_em: datetime

# Modelos para Dashboard
class DashboardStats(BaseModel):
    total_usuarios: int
    usuarios_ativos: int
    assinaturas_ativas: int
    receita_mensal: float

