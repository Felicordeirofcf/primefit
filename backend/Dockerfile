# Imagem base leve do Python
FROM python:3.11-slim

# Impede a criação de arquivos .pyc
ENV PYTHONDONTWRITEBYTECODE=1
# Exibe logs imediatamente
ENV PYTHONUNBUFFERED=1

# REMOVIDO: ENV PORT=8080 - Deixaremos o Railway injetar a variável PORT

# Diretório de trabalho no container
WORKDIR /app

# Copiar apenas o requirements.txt e instalar dependências primeiro (para cache eficiente)
COPY requirements.txt .

# Instala pip atualizado e as dependências do projeto
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copia o restante da aplicação
COPY . .

# Expõe a porta usada pelo Railway (geralmente 8080 ou a porta injetada)
EXPOSE 8080

# Comando para iniciar o servidor com Uvicorn usando a variável de ambiente PORT
# 'main:app' refere-se ao arquivo main.py e à instância 'app' dentro dele
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
