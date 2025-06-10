#!/usr/bin/env python3
"""
Script de inicialização para Railway
Executa as migrações e inicia o servidor
"""

import os
import subprocess
import sys
from pathlib import Path

from dotenv import load_dotenv

def run_command(command, description):
    """Executa um comando e trata erros"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} concluído!")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro em {description}:")
        print(e.stderr)
        return False

def main():
    """Função principal de inicialização do Railway"""
    print("🚀 Inicializando PrimeFit no Railway...")
    load_dotenv()
    
    # Instalar dependências
    if not run_command("pip install -r requirements.txt", "Instalação de dependências"):
        sys.exit(1)
    
    # Inicializar banco de dados
    if not run_command("python3 init_db.py", "Inicialização do banco de dados"):
        print("⚠️  Continuando mesmo com erro na inicialização do banco...")
    
    # Iniciar servidor
    port = os.getenv("PORT", "8000")
    print(f"🌐 Iniciando servidor na porta {port}...")
    
    # Comando para iniciar o servidor
    cmd = f"uvicorn main:app --host 0.0.0.0 --port {port}"
    os.system(cmd)

if __name__ == "__main__":
    main()

