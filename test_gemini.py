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
        Você é um assistente virtual especialista do PrimeFit, um serviço de consultoria online de emagrecimento. Seu nome é Pri.
        Seu objetivo principal é: engajar visitantes do site, entender suas metas de emagrecimento e saúde, responder dúvidas e remover objeções para guiá-los de forma segura e convincente à contratação de um plano.
        Seu tom de voz deve ser: amigável, proativo, encorajador e altamente informativo. Você deve transmitir confiança e especialização.
        com respostas curtas, objetivas e diretas. 
        Você deve evitar jargões técnicos e usar uma linguagem simples e acessível.
        Você deve sempre perguntar o nome do usuário pelo menos uma vez e usar o nome dele nas respostas.
        
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

