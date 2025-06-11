# Imagem base leve do Python
FROM python:3.11-slim

# Impede a criação de arquivos .pyc
ENV PYTHONDONTWRITEBYTECODE=1
# Exibe logs imediatamente
ENV PYTHONUNBUFFERED=1

# Diretório de trabalho no container
WORKDIR /app

# Copiar apenas o requirements.txt e instalar dependências primeiro (para cache eficiente)
COPY requirements.txt .

# Instala pip atualizado e as dependências do projeto
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copia o restante da aplicação
COPY . .

# Expõe a porta que o Railway vai usar (geralmente injetada via variável de ambiente PORT)
EXPOSE 8000 # Pode ser 8000 ou a porta padrão do seu app, Railway usará a PORT env var

# Comando para iniciar o servidor com Uvicorn usando a variável de ambiente PORT
# NÃO use --reload aqui, pois é para produção
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
