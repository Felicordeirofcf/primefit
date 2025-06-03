from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# Inicializa a aplicação FastAPI
app = FastAPI(
    title="PrimeFit API",
    description="Sistema de autenticação e gerenciamento com Supabase",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Habilita CORS para o frontend React (ajuste para produção!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Ajuste para produção
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Importação das rotas
from src.api.endpoints import auth, users, trainings, assessments, payments, content
from src.api.endpoints import profiles, progress, messages, dashboard, admin

# Registro de todas as rotas da aplicação
app.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
app.include_router(users.router, prefix="/users", tags=["Usuários"])
app.include_router(profiles.router, prefix="/profiles", tags=["Perfis"])
app.include_router(trainings.router, prefix="/trainings", tags=["Treinos"])
app.include_router(progress.router, prefix="/progress", tags=["Progresso"])
app.include_router(assessments.router, prefix="/assessments", tags=["Avaliações"])
app.include_router(messages.router, prefix="/messages", tags=["Mensagens"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(admin.router, prefix="/admin", tags=["Administração"])
app.include_router(payments.router, prefix="/payments", tags=["Pagamentos"])
app.include_router(content.router, prefix="/content", tags=["Conteúdo"])

@app.get("/")
async def root():
    return {"message": "Bem-vindo à API do PrimeFit! Acesse /docs para a documentação."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
