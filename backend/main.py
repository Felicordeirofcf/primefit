import os
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

# Banco de dados
from src.core.database import create_tables
from src.core.models import Base

# Modelos com títulos únicos (para evitar conflito no Swagger)
from routes.cadastro import ClienteCreate
from routes.cliente import ClienteRead

# Rotas
from routes import (
    auth,
    cadastro,
    cliente,
    upload_pdf,
    trainings,
    assessments,
    progress,
    messages,
    profiles,
    gemini,
)

# Chatbot (opcional)
try:
    from routes import chatbot
    HAS_CHATBOT = True
except ImportError:
    chatbot = None
    HAS_CHATBOT = False

# Inicialização do app
app = FastAPI(
    title="PrimeFit API",
    description="API para o sistema PrimeFit - PostgreSQL + FastAPI",
    version="2.0.0"
)

# Middleware CORS (em produção, especifique domínios confiáveis)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://renewed-miracle-production.up.railway.app"],  # 🔒 RECOMENDADO restringir isso em produção
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Arquivos estáticos (PDFs, imagens, etc)
app.mount("/storage", StaticFiles(directory="./storage"), name="storage")

# Rota de verificação de status
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "message": "PrimeFit API is running",
        "version": app.version
    }

# Inclusão das rotas organizadas por funcionalidade
app.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
app.include_router(cadastro.router, prefix="/api", tags=["Cadastro"])
app.include_router(cliente.router, prefix="/api", tags=["Cliente"])
app.include_router(upload_pdf.router, prefix="/api", tags=["Upload"])
app.include_router(trainings.router, tags=["Treinos"])
app.include_router(assessments.router, tags=["Avaliações"])
app.include_router(progress.router, tags=["Progresso"])
app.include_router(messages.router, tags=["Mensagens"])
app.include_router(profiles.router, tags=["Perfis"])
app.include_router(gemini.router, tags=["IA Gemini"])

if HAS_CHATBOT:
    app.include_router(chatbot.router, prefix="/api", tags=["Chatbot"])

# Tratamento global de erros (útil em produção para logs centralizados)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Erro não tratado: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Erro interno no servidor."}
    )

# Inicialização automática das tabelas ao iniciar a API
@app.on_event("startup")
async def startup_event():
    create_tables()
