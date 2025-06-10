# Configuração de storage local para substituir sistema de arquivos externo
import os
import uuid
from pathlib import Path
from typing import Optional
import shutil

class LocalStorageClient:
    """Cliente de storage local para gerenciamento de arquivos"""
    
    def __init__(self, base_path: str = "./storage"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
        
        # Criar diretórios para diferentes tipos de arquivo
        self.buckets = {
            "arquivos": self.base_path / "arquivos",
            "treinos": self.base_path / "treinos",
            "avatars": self.base_path / "avatars"
        }
        
        for bucket_path in self.buckets.values():
            bucket_path.mkdir(parents=True, exist_ok=True)
    
    def upload(self, bucket: str, file_path: str, file_content: bytes, content_type: str = None) -> dict:
        """Upload de arquivo para storage local"""
        if bucket not in self.buckets:
            raise ValueError(f"Bucket '{bucket}' não existe")
        
        # Criar caminho completo do arquivo
        full_path = self.buckets[bucket] / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Salvar arquivo
        with open(full_path, 'wb') as f:
            f.write(file_content)
        
        return {
            "path": file_path,
            "full_path": str(full_path),
            "bucket": bucket,
            "size": len(file_content)
        }
    
    def get_public_url(self, bucket: str, file_path: str) -> str:
        """Gera URL pública para o arquivo"""
        # Em produção, isso seria uma URL real do servidor
        # Por enquanto, retornamos um caminho relativo
        base_url = os.getenv("BASE_URL", "http://localhost:8000")
        return f"{base_url}/storage/{bucket}/{file_path}"
    
    def delete(self, bucket: str, file_path: str) -> bool:
        """Remove arquivo do storage"""
        if bucket not in self.buckets:
            return False
        
        full_path = self.buckets[bucket] / file_path
        if full_path.exists():
            full_path.unlink()
            return True
        return False
    
    def exists(self, bucket: str, file_path: str) -> bool:
        """Verifica se arquivo existe"""
        if bucket not in self.buckets:
            return False
        
        full_path = self.buckets[bucket] / file_path
        return full_path.exists()
    
    def list_files(self, bucket: str, prefix: str = "") -> list:
        """Lista arquivos no bucket"""
        if bucket not in self.buckets:
            return []
        
        bucket_path = self.buckets[bucket]
        if prefix:
            search_path = bucket_path / prefix
        else:
            search_path = bucket_path
        
        files = []
        if search_path.exists():
            for file_path in search_path.rglob("*"):
                if file_path.is_file():
                    relative_path = file_path.relative_to(bucket_path)
                    files.append(str(relative_path))
        
        return files

# Instância global do storage
storage_client = LocalStorageClient()

def get_storage_client() -> LocalStorageClient:
    """Retorna instância do cliente de storage"""
    return storage_client

