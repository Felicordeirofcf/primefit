from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

# 🔌 Importação das rotas
from routes import auth, admin, cliente, cadastro, upload_pdf

app = FastAPI(
    title="Dropshipping API",
    description="Sistema de autenticação e gerenciamento com Supabase",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 🌐 Habilita CORS para o frontend React (ajuste para produção!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # ou use ["*"] em testes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Registro de todas as rotas da aplicação
app.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(cliente.router, prefix="/cliente", tags=["Cliente"])
app.include_router(cadastro.router, prefix="/api", tags=["Cadastro Público"])
app.include_router(upload_pdf.router, prefix="/admin", tags=["Upload PDF"])

# 🔐 Swagger personalizado com suporte a autenticação JWT
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    for path in openapi_schema["paths"].values():
        for method in path.values():
            method.setdefault("security", []).append({"BearerAuth": []})

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
