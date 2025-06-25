import os
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, Response
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

# Banco de dados
from src.core.database import create_tables
from src.core.models import Base

# Modelos com títulos únicos (para evitar conflito no Swagger)
from src.schemas.user import UserCreate

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
    admin,
    content,
    dashboard,
    payments,
    users,
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
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Middleware CORS (em produção, especifique domínios confiáveis)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://renewed-miracle-production.up.railway.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Arquivos estáticos
app.mount("/storage", StaticFiles(directory="./storage"), name="storage")

# Rota raiz
@app.get("/", include_in_schema=False)
async def root():
    return {
        "name": "PrimeFit API",
        "version": app.version,
        "docs": "/docs",
        "health": "/health"
    }

# Favicon
@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    favicon_path = os.path.join("static", "favicon.ico")
    if os.path.exists(favicon_path):
        return FileResponse(favicon_path)
    return Response(status_code=204)

# Health check
@app.get("/health", include_in_schema=True, tags=["Sistema"])
async def health_check():
    return {
        "status": "ok",
        "message": "PrimeFit API is running",
        "version": app.version
    }

# Inclusão das rotas com prefixos corretos
app.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
app.include_router(cadastro.router, prefix="/api", tags=["Cadastro"])
app.include_router(cliente.router, prefix="/api", tags=["Cliente"])
app.include_router(upload_pdf.router, prefix="/api", tags=["Upload"])
app.include_router(trainings.router, prefix="/api", tags=["Treinos"])         # ✅ corrigido
app.include_router(assessments.router, prefix="/api", tags=["Avaliações"])    # ✅ corrigido
app.include_router(progress.router, prefix="/api", tags=["Progresso"])        # ✅ corrigido
app.include_router(messages.router, prefix="/messages", tags=["Mensagens"])
app.include_router(profiles.router, prefix="/profiles", tags=["Perfis"])
app.include_router(gemini.router, prefix="/gemini", tags=["IA Gemini"])
app.include_router(admin.router, prefix="/api", tags=["Admin"])
app.include_router(content.router, prefix="/api", tags=["Conteúdo"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(payments.router, prefix="/api", tags=["Pagamentos"])
app.include_router(users.router, prefix="/api", tags=["Usuários"])

if HAS_CHATBOT:
    app.include_router(chatbot.router, prefix="/api", tags=["Chatbot"])

# Tratamento global de erros
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Erro não tratado: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Erro interno no servidor."}
    )

# Inicialização automática das tabelas
@app.on_event("startup")
async def startup_event():
    logger.info("Iniciando aplicação PrimeFit API")
    try:
        create_tables()
        logger.info("✅ Tabelas criadas com sucesso.")
    except Exception as e:
        logger.error(f"❌ Erro ao criar tabelas: {e}", exc_info=True)
