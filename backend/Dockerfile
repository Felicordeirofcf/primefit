# Imagem base leve do Python
FROM python:3.11-slim

# Impede a criação de arquivos .pyc
ENV PYTHONDONTWRITEBYTECODE=1
# Exibe logs imediatamente
ENV PYTHONUNBUFFERED=1

# Define a porta padrão
ENV PORT=8080

# Diretório de trabalho no container
WORKDIR /app

# Copiar apenas o requirements.txt e instalar dependências primeiro (para cache eficiente)
COPY requirements.txt .

# Instala pip atualizado e as dependências do projeto
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copia o restante da aplicação
COPY . .

# Expõe a porta usada pelo Railway (obrigatoriamente 8080)
EXPOSE 8080

# Comando para iniciar o servidor com Uvicorn na porta definida pela variável de ambiente PORT
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "$PORT"]
