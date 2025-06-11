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

# Forçar invalidação do cache para a instalação de dependências
# Esta linha mudará a cada build, garantindo que a camada de pip install não seja cacheada
# Removi a linha 'RUN echo 
