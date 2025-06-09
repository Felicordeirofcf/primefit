import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from src.core.database import engine, create_tables
from src.core.models import Base

# Carregar variáveis de ambiente
load_dotenv()

# Importar rotas
from routes import auth, cadastro, cliente, upload_pdf

# Criar aplicação FastAPI
app = FastAPI(
    title="PrimeFit API",
    description="API para o sistema PrimeFit - PostgreSQL + FastAPI",
    version="2.0.0"
)

# Configurar CORS dinamicamente a partir da variável de ambiente CORS_ORIGINS
origins = os.getenv("CORS_ORIGINS", "").split(",")
origins = [origin.strip() for origin in origins if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar arquivos estáticos para servir uploads
app.mount("/storage", StaticFiles(directory="/app/storage"), name="storage")

# Rota de verificação de saúde
@app.get("/health")
async def health_check():
    """
    Verifica se a API está funcionando.
    """
    return {"status": "ok", "message": "PrimeFit API is running", "version": "2.0.0"}

# Incluir rotas
app.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
app.include_router(cadastro.router, prefix="/api", tags=["Cadastro"])
app.include_router(cliente.router, prefix="/api", tags=["Cliente"])
app.include_router(upload_pdf.router, prefix="/api", tags=["Upload"])

# Tratamento de exceções
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Manipulador global de exceções.
    """
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Erro interno: {str(exc)}"}
    )

# Inicializar banco de dados na inicialização
@app.on_event("startup")
async def startup_event():
    """
    Eventos executados na inicialização da aplicação
    """
    try:
        # Criar tabelas se não existirem
        create_tables()
        print("✅ Banco de dados inicializado")
    except Exception as e:
        print(f"⚠️  Erro na inicialização do banco: {e}")

if __name__ == "__main__":
    import uvicorn

    # Obter porta do ambiente (Railway define PORT automaticamente)
    port = int(os.getenv("PORT", "8080"))

    # Iniciar servidor
    uvicorn.run(
        "main:app",
        host="0.0.0.0",  # Bind em todas as interfaces
        port=port,
        reload=os.getenv("ENVIRONMENT", "development") == "development"
    )
