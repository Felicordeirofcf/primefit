from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from src.core.db_client import get_database_client
from src.core.storage import get_storage_client
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    cliente_email: str = Form(...)
):
    try:
        # Ler conteúdo do arquivo
        contents = await file.read()
        
        # Gerar nome único para o arquivo
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'pdf'
        unique_filename = f"{timestamp}_{uuid.uuid4().hex[:8]}.{file_extension}"

        # 📤 Upload para storage local (bucket "treinos")
        storage_client = get_storage_client()
        upload_result = storage_client.upload(
            bucket="treinos",
            file_path=unique_filename,
            file_content=contents,
            content_type=file.content_type
        )

        # 🔗 Gera URL pública
        public_url = storage_client.get_public_url("treinos", unique_filename)

        # 💾 Salva registro na tabela treinos_enviados
        db_client = get_database_client()
        training_data = {
            "cliente_email": cliente_email,
            "nome_arquivo": file.filename,
            "url_pdf": public_url
        }
        
        db_client.create_training_record(training_data)
        db_client.close()

        return {
            "message": "✅ PDF enviado e salvo com sucesso!",
            "url": public_url
        }

    except Exception as e:
        print("❌ Erro no upload:", e)
        raise HTTPException(status_code=500, detail=f"Erro inesperado: {str(e)}")
