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
from routes import auth, cadastro, cliente, upload_pdf, trainings, assessments, progress, messages, profiles

# Criar aplicação FastAPI
app = FastAPI(
    title="PrimeFit API",
    description="API para o sistema PrimeFit - PostgreSQL + FastAPI",
    version="2.0.0"
)

# Configurar CORS
origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],  # fallback
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
app.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
app.include_router(cadastro.router, prefix="/api", tags=["Cadastro"])
app.include_router(cliente.router, prefix="/api", tags=["Cliente"])
app.include_router(upload_pdf.router, prefix="/api", tags=["Upload"])
app.include_router(trainings.router, prefix="/api", tags=["Treinos"])
app.include_router(assessments.router, prefix="/api", tags=["Avaliações"])
app.include_router(progress.router, prefix="/api", tags=["Progresso"])
app.include_router(messages.router, prefix="/api", tags=["Mensagens"])
app.include_router(profiles.router, prefix="/api", tags=["Perfis"])

# Tratamento global de exceções
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Erro não tratado: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_ERROR,
        content={"detail": "Erro interno no servidor."}
    )

# Inicialização do banco de dados
@app.on_event("startup")
async def startup_event():
    create_tables()


