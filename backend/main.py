import os
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from src.core.database import create_tables
from src.core.models import Base

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

# Importar rotas
from routes import auth, cadastro, cliente, upload_pdf, trainings, assessments, progress, messages, profiles, gemini

# Criar aplicação FastAPI
app = FastAPI(
    title="PrimeFit API",
    description="API para o sistema PrimeFit - PostgreSQL + FastAPI",
    version="2.0.0"
)

# Configurar CORS
# ATENÇÃO: Permitir todas as origens (["*"]) é apenas para depuração.
# Em produção, você deve listar explicitamente os domínios permitidos.
origins = ["*"] # Temporariamente permite todas as origens para depuração
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar arquivos estáticos (ex: PDF de treinos)
app.mount("/storage", StaticFiles(directory="./storage"), name="storage")

# Rota de verificação de saúde
@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "PrimeFit API is running", "version": app.version}

# Incluir rotas principais
# Removendo o prefixo /api para as rotas que o frontend acessa diretamente
app.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
app.include_router(cadastro.router, prefix="/api", tags=["Cadastro"])
app.include_router(cliente.router, prefix="/api", tags=["Cliente"])
app.include_router(upload_pdf.router, prefix="/api", tags=["Upload"])
app.include_router(trainings.router, tags=["Treinos"]) # Removido prefixo /api
app.include_router(assessments.router, tags=["Avaliações"]) # Removido prefixo /api
app.include_router(progress.router, tags=["Progresso"]) # Removido prefixo /api
app.include_router(messages.router, tags=["Mensagens"]) # Removido prefixo /api
app.include_router(profiles.router, tags=["Perfis"]) # Removido prefixo /api
app.include_router(gemini.router, tags=["IA Gemini"]) # Novas funcionalidades de IA

# Tratamento global de exceções
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
