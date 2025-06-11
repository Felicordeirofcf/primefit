import os
import google.generativeai as genai
from typing import Dict, Any, Optional
import json
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiClient:
    def __init__(self):
        """Inicializa o cliente Gemini com a API key"""
        self.api_key = os.getenv("GEMINI_API_KEY", "AIzaSyBkaxIOV56vevsZZPzPGxVepOkwT0cQF8Q")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY não encontrada nas variáveis de ambiente")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
    async def generate_response(self, prompt: str, system_prompt: str = "") -> str:
        """
        Gera uma resposta usando o Gemini
        
        Args:
            prompt: Prompt do usuário
            system_prompt: Prompt de sistema para contexto
            
        Returns:
            Resposta gerada pela IA
        """
        try:
            # Combinar prompt de sistema com prompt do usuário
            full_prompt = f"{system_prompt}\n\nUsuário: {prompt}"
            
            response = self.model.generate_content(full_prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"Erro ao gerar resposta do Gemini: {str(e)}")
            return "Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente."
    
    async def generate_json_response(self, prompt: str, system_prompt: str = "") -> Dict[str, Any]:
        """
        Gera uma resposta em formato JSON usando o Gemini
        
        Args:
            prompt: Prompt do usuário
            system_prompt: Prompt de sistema para contexto
            
        Returns:
            Resposta em formato JSON
        """
        try:
            # Adicionar instrução para retornar JSON válido
            json_instruction = "\n\nIMPORTANTE: Sua resposta DEVE ser um JSON válido. Não inclua texto adicional antes ou depois do JSON."
            full_prompt = f"{system_prompt}{json_instruction}\n\nUsuário: {prompt}"
            
            response = self.model.generate_content(full_prompt)
            response_text = response.text.strip()
            
            # Tentar parsear como JSON
            try:
                return json.loads(response_text)
            except json.JSONDecodeError:
                # Se não conseguir parsear, tentar extrair JSON do texto
                if '```json' in response_text:
                    start = response_text.find('```json') + 7
                    end = response_text.find('```', start)
                    if end != -1:
                        json_text = response_text[start:end].strip()
                        return json.loads(json_text)
                
                # Tentar encontrar JSON entre chaves
                start = response_text.find('[')
                end = response_text.rfind(']') + 1
                if start != -1 and end > start:
                    json_text = response_text[start:end]
                    return json.loads(json_text)
                
                # Se ainda não conseguir, retornar erro estruturado
                logger.error(f"Não foi possível extrair JSON válido: {response_text[:200]}...")
                return {"error": "Formato de resposta inválido", "raw_response": response_text}
                
        except Exception as e:
            logger.error(f"Erro ao gerar resposta JSON do Gemini: {str(e)}")
            return {"error": "Erro ao processar solicitação"}

# Instância global do cliente
gemini_client = GeminiClient()

