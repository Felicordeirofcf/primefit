# Imagem base leve do Python
FROM python:3.11-slim

# Impede a criação de arquivos .pyc
ENV PYTHONDONTWRITEBYTECODE=1
# Exibe logs imediatamente
ENV PYTHONUNBUFFERED=1

# Diretório de trabalho no container
WORKDIR /app

# ...
COPY requirements.txt .

# Adicione esta linha para forçar a reinstalação de bcrypt e passlib
RUN pip uninstall -y bcrypt passlib || true # Use || true para evitar falha se não estiverem instalados

# Instala pip atualizado e as dependências do projeto
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt
# ...
