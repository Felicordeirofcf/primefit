from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging

from src.core.gemini_client import gemini_client

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Modelos Pydantic para requests
class ChatMessage(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = []

class TrainingPlanRequest(BaseModel):
    objetivo: str
    nivel: str
    dias_disponiveis: int
    tempo_por_sessao: str
    equipamentos: str
    restricoes: Optional[str] = ""

class PerformanceFeedbackRequest(BaseModel):
    historico_exercicio: str
    feedback_usuario: str

class AlternativeExerciseRequest(BaseModel):
    exercicio_original: str
    motivo: str
    equipamentos: str

class MealRecommendationRequest(BaseModel):
    calorias_objetivo: int
    preferencias: str
    restricoes: Optional[str] = ""

class SentimentAnalysisRequest(BaseModel):
    texto_do_usuario: str

class ContentGenerationRequest(BaseModel):
    tema: str
    formato: str
    palavras_chave: Optional[str] = ""

# Prompts de sistema
CHATBOT_PRE_VENDA_PROMPT = """
1. Persona e Objetivo:
Você é a Pri, assistente virtual especialista do PrimeFit. Seu único objetivo é, após uma breve e amigável saudação, direcionar o visitante de forma rápida e convincente para o WhatsApp, onde um consultor humano continuará a conversa e fará a venda.

2. Tom de Voz:
Amigável, motivador e direto ao ponto.

3. Roteiro da Conversa:

Passo 1: Apresentação e Pergunta Inicial

Sempre comece a conversa com a seguinte frase:
"Olá! Eu sou a Pri, a assistente virtual do PrimeFit. Estou aqui para te ajudar a dar o primeiro passo na sua jornada de emagrecimento! Para começar, me conta: qual é o seu principal objetivo? (Ex: perder 10kg, ter mais disposição, definir o corpo, etc.)"

Passo 2: Após a Resposta do Cliente (O Direcionamento)

Valide o objetivo do cliente e direcione IMEDIATAMENTE para o WhatsApp. Use uma destas opções:

Opção A (Foco em Plano Gratuito):

"Entendi! [Repita o objetivo do cliente aqui] é uma meta excelente e totalmente alcançável com o nosso método. Para que um de nossos especialistas possa montar uma pré-avaliação gratuita para você e te explicar como funciona, vamos continuar a conversa no WhatsApp? É só clicar no link abaixo!"

[➡️ Sim, quero minha pré-avaliação gratuita no WhatsApp!](tel:+55219877086552)

Opção B (Foco em Atendimento Imediato):

"Que ótimo objetivo! Nós já ajudamos milhares de pessoas a [Repita o objetivo do cliente aqui]. O próximo passo é falar com um de nossos consultores no WhatsApp para uma avaliação rápida e sem compromisso. Eles estão prontos para te atender agora."

[➡️ Falar com um consultor no WhatsApp agora!](tel:+55219877086552)

Passo 3: Lidando com Objeções Comuns (Sempre termine direcionando para o WhatsApp)

Se o cliente perguntar o PREÇO ("Quanto custa?", "É caro?"):

"O investimento no seu bem-estar é super acessível e temos planos flexíveis! Nosso consultor no WhatsApp pode te explicar todas as opções de valores e as promoções ativas, sem compromisso. Ele encontra o plano perfeito para você."

[➡️ Ver planos e valores no WhatsApp.](tel:+55219877086552)

Se o cliente disser que NÃO TEM TEMPO ("Minha rotina é corrida"):

"Eu entendo perfeitamente! É por isso que o PrimeFit cria treinos curtos e eficientes que se encaixam no seu dia. No WhatsApp, nosso consultor pode te mostrar como isso funciona na prática, que tal? É super rápido."

[➡️ Entender como funciona para quem não tem tempo.](tel:+55219877086552)

Passo 4: Se o Cliente Fizer uma Pergunta Complexa ou Insistir:

Use esta resposta padrão para qualquer outra dúvida que saia do roteiro:
"Essa é uma ótima pergunta e merece uma resposta completa! Quem pode te explicar isso em detalhes é o nosso consultor especialista. Para tirar todas as suas dúvidas, fale com ele."
[➡️ Falar com um especialista no WhatsApp.](tel:+55219877086552)
"""

TRAINING_PLAN_PROMPT = """
Você é um personal trainer de elite, especialista em fisiologia do exercício e biomecânica.
Sua tarefa é: criar um plano de treino semanal detalhado, com base nos dados do usuário:

Objetivo: {objetivo}
Nível: {nivel}
Dias por semana: {dias_disponiveis}
Tempo por sessão: {tempo_por_sessao}
Equipamentos: {equipamentos}
Restrições ou Lesões: {restricoes}

Formato da Resposta: A sua resposta DEVE ser um objeto JSON válido. A estrutura deve ser:
[
  {{
    "dia": "Segunda-feira",
    "foco": "Membros Superiores",
    "exercicios": [
      {{
        "nome": "Flexão de Braço",
        "series": 3,
        "repeticoes": "até a falha"
      }}
    ]
  }}
]
"""

PERFORMANCE_FEEDBACK_PROMPT = """
Você é um coach de performance, especialista em analisar dados de treino para fornecer feedback motivacional e construtivo.
Sua tarefa é: analisar o registro de treino do usuário e fornecer um feedback curto (3 a 4 frases), destacando progressos e sugerindo um ponto de foco para o próximo treino.

Dados do Treino para Análise:
Histórico do exercício: {historico_exercicio}
Feedback do usuário: {feedback_usuario}

Tom de voz: Seja encorajador e positivo. Comece reconhecendo o esforço do usuário.
"""

ALTERNATIVE_EXERCISE_PROMPT = """
Você é uma enciclopédia de exercícios de musculação e funcional.
Sua tarefa é: com base no exercício que o usuário não pode fazer e no motivo, sugerir 3 exercícios alternativos que trabalhem o mesmo grupo muscular principal.

Dados para a sugestão:
Exercício a ser substituído: {exercicio_original}
Motivo: {motivo}
Equipamentos disponíveis: {equipamentos}

Formato da Resposta: Responda em uma lista simples, apenas com os nomes dos exercícios.
"""

MEAL_RECOMMENDATION_PROMPT = """
Você é um nutricionista focado em alimentação prática e saudável.
Sua tarefa é: criar 3 opções de jantar que se encaixem nas preferências e objetivos do usuário.

Dados do usuário:
Objetivo calórico diário: {calorias_objetivo}
Preferências alimentares: {preferencias}
Restrições: {restricoes}

Formato da Resposta: Forneça uma lista com o nome da refeição e uma breve descrição de como prepará-la.
"""

SENTIMENT_ANALYSIS_PROMPT = """
Você é um especialista em análise de sentimento. Sua única tarefa é classificar o texto fornecido.
Texto para análise: {texto_do_usuario}
Instrução: Analise o sentimento expresso no texto e responda APENAS com uma das seguintes palavras: Positivo, Negativo, Neutro, Frustrado, Desmotivado.
"""

CONTENT_GENERATION_PROMPT = """
Você é um especialista em marketing de conteúdo para a área de fitness e bem-estar.
Sua tarefa é: criar um rascunho de conteúdo com base no tema e formato solicitados. O texto deve ser otimizado para SEO e engajamento.

Solicitação:
Tema: {tema}
Formato: {formato} (ex: post para blog, roteiro para vídeo curto, legenda para Instagram)
Palavras-chave: {palavras_chave}
"""

@router.post("/api/chatbot/pre-venda")
async def chatbot_pre_venda(request: ChatMessage):
    """Endpoint para chatbot de pré-venda"""
    try:
        # Construir contexto da conversa
        conversation_context = ""
        if request.conversation_history:
            for msg in request.conversation_history[-5:]:  # Últimas 5 mensagens
                conversation_context += f"{msg.get('role', 'user')}: {msg.get('content', '')}\n"
        
        full_prompt = f"{conversation_context}\nUsuário: {request.message}"
        
        response = await gemini_client.generate_response(
            prompt=full_prompt,
            system_prompt=CHATBOT_PRE_VENDA_PROMPT
        )
        
        return {"response": response, "status": "success"}
        
    except Exception as e:
        logger.error(f"Erro no chatbot de pré-venda: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.post("/api/training/generate-plan")
async def generate_training_plan(request: TrainingPlanRequest):
    """Endpoint para geração de planos de treino"""
    try:
        prompt = TRAINING_PLAN_PROMPT.format(
            objetivo=request.objetivo,
            nivel=request.nivel,
            dias_disponiveis=request.dias_disponiveis,
            tempo_por_sessao=request.tempo_por_sessao,
            equipamentos=request.equipamentos,
            restricoes=request.restricoes
        )
        
        response = await gemini_client.generate_json_response(
            prompt="Gere o plano de treino conforme especificado.",
            system_prompt=prompt
        )
        
        return {"training_plan": response, "status": "success"}
        
    except Exception as e:
        logger.error(f"Erro na geração de plano de treino: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.post("/api/training/performance-feedback")
async def performance_feedback(request: PerformanceFeedbackRequest):
    """Endpoint para análise de desempenho e feedback"""
    try:
        prompt = PERFORMANCE_FEEDBACK_PROMPT.format(
            historico_exercicio=request.historico_exercicio,
            feedback_usuario=request.feedback_usuario
        )
        
        response = await gemini_client.generate_response(
            prompt="Analise o desempenho e forneça feedback.",
            system_prompt=prompt
        )
        
        return {"feedback": response, "status": "success"}
        
    except Exception as e:
        logger.error(f"Erro na análise de desempenho: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.post("/api/training/alternative-exercises")
async def alternative_exercises(request: AlternativeExerciseRequest):
    """Endpoint para sugestão de exercícios alternativos"""
    try:
        prompt = ALTERNATIVE_EXERCISE_PROMPT.format(
            exercicio_original=request.exercicio_original,
            motivo=request.motivo,
            equipamentos=request.equipamentos
        )
        
        response = await gemini_client.generate_response(
            prompt="Sugira exercícios alternativos.",
            system_prompt=prompt
        )
        
        return {"alternatives": response, "status": "success"}
        
    except Exception as e:
        logger.error(f"Erro na sugestão de exercícios alternativos: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.post("/api/nutrition/meal-recommendations")
async def meal_recommendations(request: MealRecommendationRequest):
    """Endpoint para recomendações de refeições"""
    try:
        prompt = MEAL_RECOMMENDATION_PROMPT.format(
            calorias_objetivo=request.calorias_objetivo,
            preferencias=request.preferencias,
            restricoes=request.restricoes
        )
        
        response = await gemini_client.generate_response(
            prompt="Sugira opções de refeições.",
            system_prompt=prompt
        )
        
        return {"meal_recommendations": response, "status": "success"}
        
    except Exception as e:
        logger.error(f"Erro nas recomendações de refeições: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.post("/api/admin/sentiment-analysis")
async def sentiment_analysis(request: SentimentAnalysisRequest):
    """Endpoint para análise de sentimento (uso interno)"""
    try:
        prompt = SENTIMENT_ANALYSIS_PROMPT.format(
            texto_do_usuario=request.texto_do_usuario
        )
        
        response = await gemini_client.generate_response(
            prompt="Analise o sentimento do texto.",
            system_prompt=prompt
        )
        
        return {"sentiment": response.strip(), "status": "success"}
        
    except Exception as e:
        logger.error(f"Erro na análise de sentimento: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.post("/api/admin/content-generation")
async def content_generation(request: ContentGenerationRequest):
    """Endpoint para geração de conteúdo (uso interno)"""
    try:
        prompt = CONTENT_GENERATION_PROMPT.format(
            tema=request.tema,
            formato=request.formato,
            palavras_chave=request.palavras_chave
        )
        
        response = await gemini_client.generate_response(
            prompt="Gere o conteúdo conforme solicitado.",
            system_prompt=prompt
        )
        
        return {"content": response, "status": "success"}
        
    except Exception as e:
        logger.error(f"Erro na geração de conteúdo: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.post("/api/chatbot/support")
async def chatbot_support(request: ChatMessage):
    """Endpoint para chatbot de suporte ao cliente"""
    try:
        support_prompt = """
        Você é um assistente de suporte do PrimeFit, especializado em ajudar clientes com dúvidas sobre:
        - Nutrição e alimentação saudável
        - Exercícios e treinos
        - Uso da plataforma
        - Dúvidas técnicas básicas
        
        Seja sempre prestativo, educativo e encoraje o cliente a continuar sua jornada de emagrecimento.
        Se a dúvida for muito técnica ou específica, sugira contato com a equipe de suporte humano.
        """
        
        response = await gemini_client.generate_response(
            prompt=request.message,
            system_prompt=support_prompt
        )
        
        return {"response": response, "status": "success"}
        
    except Exception as e:
        logger.error(f"Erro no chatbot de suporte: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

