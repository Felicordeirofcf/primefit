#!/usr/bin/env python3.11

import os
import sys
import asyncio
from dotenv import load_dotenv

# Adicionar o diretório do projeto ao path
sys.path.append('/home/ubuntu/primefit_project/backend')

# Carregar variáveis de ambiente
load_dotenv()

from src.core.gemini_client import gemini_client

async def test_gemini_integration():
    """Testa a integração com a API do Gemini"""
    
    print("🧪 Testando integração com API Gemini...")
    print(f"API Key configurada: {'✅' if os.getenv('GEMINI_API_KEY') else '❌'}")
    
    # Teste 1: Chatbot de pré-venda
    print("\n1️⃣ Testando chatbot de pré-venda...")
    try:
        prompt_pre_venda = """
        Você é a Pri, assistente virtual da PrimeFit Consulting, referência em saúde, estética e bem-estar.

Seu objetivo é:
- Apresentar nossos serviços de consultoria online personalizada para emagrecimento e bem-estar.
- Fornecer informações claras e objetivas sobre nossos planos e diferenciais.
- Incentivar o visitante a entrar em contato com um especialista via WhatsApp: https://wa.me/5521987708652

Informações importantes:
- Oferecemos consultoria online com planos personalizados de treino e alimentação.
- Nossos planos incluem acompanhamento semanal com profissionais qualificados.
- Integramos tecnologia de ponta através de aplicativos como MFIT e Tecnofit para monitoramento e suporte.
- Trabalhamos com produtos naturais de alta qualidade para potencializar os resultados.
- Nossos planos são:
  - Série Única (modelo SaaS): R$ 80
  - Consultoria Completa com acompanhamento semanal: R$ 150

Instruções de comportamento:
- Seja amigável, proativa e encorajadora.
- Responda de forma clara e objetiva, evitando perguntas excessivas.
- Após fornecer as informações solicitadas, redirecione o visitante para o WhatsApp para um atendimento mais personalizado.

Mensagem inicial sugerida:
"Olá! Sou a Pri, assistente virtual da PrimeFit Consulting 💪
Está buscando uma transformação saudável e eficaz? Fale agora mesmo com um de nossos especialistas pelo WhatsApp: https://wa.me/5521987708652
Se preferir, posso responder suas dúvidas aqui mesmo 😊"
        Você deve responder de forma amigável e encorajadora, sempre incentivando o contato via WhatsApp.

        """
        
        response = await gemini_client.generate_response(
            prompt="Olá, estou interessado em emagrecer mas não sei por onde começar.",
            system_prompt=prompt_pre_venda
        )
        print(f"✅ Resposta do chatbot: {response[:100]}...")
        
    except Exception as e:
        print(f"❌ Erro no chatbot de pré-venda: {str(e)}")
    
    # Teste 2: Geração de plano de treino
    print("\n2️⃣ Testando geração de plano de treino...")
    try:
        prompt_treino = """
        Você é um personal trainer de elite, especialista em fisiologia do exercício e biomecânica.
        Sua tarefa é: criar um plano de treino semanal detalhado, com base nos dados do usuário:
        
        Objetivo: perder peso
        Nível: iniciante
        Dias por semana: 3
        Tempo por sessão: 45 minutos
        Equipamentos: peso corporal, halteres
        Restrições ou Lesões: nenhuma
        
        Formato da Resposta: A sua resposta DEVE ser um objeto JSON válido.
        """
        
        response = await gemini_client.generate_json_response(
            prompt="Gere o plano de treino conforme especificado.",
            system_prompt=prompt_treino
        )
        print(f"✅ Plano de treino gerado: {type(response)} com {len(response) if isinstance(response, list) else 'N/A'} dias")
        
    except Exception as e:
        print(f"❌ Erro na geração de plano de treino: {str(e)}")
    
    # Teste 3: Recomendações nutricionais
    print("\n3️⃣ Testando recomendações nutricionais...")
    try:
        prompt_nutricao = """
        Você é um nutricionista focado em alimentação prática e saudável.
        Sua tarefa é: criar 3 opções de jantar que se encaixem nas preferências e objetivos do usuário.
        
        Dados do usuário:
        Objetivo calórico diário: 1500
        Preferências alimentares: vegetariano, low carb
        Restrições: intolerância à lactose
        """
        
        response = await gemini_client.generate_response(
            prompt="Sugira opções de refeições.",
            system_prompt=prompt_nutricao
        )
        print(f"✅ Recomendações nutricionais: {response[:100]}...")
        
    except Exception as e:
        print(f"❌ Erro nas recomendações nutricionais: {str(e)}")
    
    print("\n🎉 Testes de integração concluídos!")

if __name__ == "__main__":
    asyncio.run(test_gemini_integration())

