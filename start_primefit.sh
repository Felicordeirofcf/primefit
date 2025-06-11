#!/bin/bash

echo "🚀 Iniciando PrimeFit com IA Gemini..."

# Navegar para o diretório do projeto
cd /home/ubuntu/primefit_project

# Instalar dependências do backend se necessário
echo "📦 Verificando dependências do backend..."
cd backend
pip3 install -q google-generativeai python-dotenv sqlalchemy psycopg2-binary fastapi uvicorn

# Iniciar backend
echo "🔧 Iniciando backend na porta 8000..."
python3.11 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Aguardar backend inicializar
sleep 5

# Verificar se backend está rodando
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend iniciado com sucesso!"
else
    echo "❌ Erro ao iniciar backend"
    exit 1
fi

# Navegar para frontend
cd ../frontend

# Instalar dependências do frontend se necessário
echo "📦 Verificando dependências do frontend..."
npm install --silent

# Iniciar frontend
echo "🎨 Iniciando frontend na porta 5173..."
npm run dev &
FRONTEND_PID=$!

# Aguardar frontend inicializar
sleep 10

echo ""
echo "🎉 PrimeFit está rodando!"
echo ""
echo "📍 URLs de acesso:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🤖 Funcionalidades de IA implementadas:"
echo "   ✅ Chatbot de pré-venda (Pri)"
echo "   ✅ Treinos inteligentes personalizados"
echo "   ✅ Análise de desempenho"
echo "   ✅ Exercícios alternativos"
echo "   ✅ Recomendações nutricionais"
echo "   ✅ Chatbot de suporte"
echo "   ✅ Análise de sentimento"
echo "   ✅ Geração de conteúdo"
echo ""
echo "🔑 API Gemini configurada e funcionando"
echo ""
echo "Para parar os serviços, pressione Ctrl+C"

# Manter script rodando
wait

