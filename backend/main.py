import os
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# Carregar variáveis de ambiente do .env
load_dotenv()

# Banco de dados e models
from src.core.database import create_tables
from src.core.models import Base

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
    gemini
)

# 🚨 Se você tiver ou for criar chatbot.py, importe aqui:
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

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Recomendado restringir isso em produção
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Arquivos estáticos (PDFs, imagens, etc)
app.mount("/storage", StaticFiles(directory="./storage"), name="storage")

# Rota de verificação de status da API
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "message": "PrimeFit API is running",
        "version": app.version
    }

# Inclusão de rotas
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

# Tratamento global de erros
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Erro não tratado: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Erro interno no servidor."}
    )

# Inicialização do banco de dados
@app.on_event("startup")
async def startup_event():
    create_tables()
