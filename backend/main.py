import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from src.core.database import engine, Base  # Import Base and engine for metadata

# Carregar variáveis de ambiente
load_dotenv()

# Importar rotas
from src.api.endpoints import auth, profiles, messages, trainings, assessments, progress, payments, content, admin, users

# Criar aplicação FastAPI
app = FastAPI(
    title="PrimeFit API",
    description="API para o sistema PrimeFit",
    version="1.0.0"
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

# Rota de verificação de saúde
@app.get("/health")
async def health_check():
    """
    Verifica se a API está funcionando.
    """
    return {"status": "ok", "message": "API is running"}

# Incluir rotas
app.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
app.include_router(profiles.router, prefix="/profiles", tags=["Perfis"])
app.include_router(messages.router, prefix="/messages", tags=["Mensagens"])
app.include_router(trainings.router, prefix="/trainings", tags=["Treinos"])
app.include_router(assessments.router, prefix="/assessments", tags=["Avaliações"])
app.include_router(progress.router, prefix="/progress", tags=["Progresso"])
app.include_router(payments.router, prefix="/payments", tags=["Pagamentos"])
app.include_router(content.router, prefix="/content", tags=["Conteúdo"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(users.router, prefix="/users", tags=["Usuários"])

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

if __name__ == "__main__":
    import uvicorn

    # Obter porta do ambiente (Railway define PORT automaticamente)
    port = int(os.getenv("PORT", "8000"))

    # Iniciar servidor
    uvicorn.run(
        "main:app",
        host="0.0.0.0",  # Bind em todas as interfaces
        port=port,
        reload=os.getenv("ENVIRONMENT", "development") == "development"
    )
