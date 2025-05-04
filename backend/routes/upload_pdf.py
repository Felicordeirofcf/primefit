from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from supabase_client import supabase
from datetime import datetime

router = APIRouter()

@router.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    cliente_email: str = Form(...)
):
    try:
        contents = await file.read()
        file_path = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{file.filename}"

        # 📤 Upload para Supabase Storage (bucket "treinos")
        response = supabase.storage.from_("treinos").upload(
            file_path,
            contents,
            {"content-type": file.content_type}
        )

        if hasattr(response, "error") and response.error:
            raise HTTPException(status_code=500, detail=f"Erro no upload: {response.error['message']}")

        # 🔗 Gera URL pública
        public_url = supabase.storage.from_("treinos").get_public_url(file_path)

        # 💾 Salva registro na tabela treinos_enviados
        supabase.table("treinos_enviados").insert({
            "cliente_email": cliente_email,
            "nome_arquivo": file.filename,
            "url_pdf": public_url,
            "enviado_em": datetime.utcnow().isoformat()
        }).execute()

        return {
            "message": "✅ PDF enviado e salvo com sucesso!",
            "url": public_url
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro inesperado: {str(e)}")
