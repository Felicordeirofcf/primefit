# Imagem base
FROM python:3.11

# Diretório de trabalho
WORKDIR /app

# Instala dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o projeto
COPY . .

# Comando de execução
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
