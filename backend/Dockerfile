# Base Python
FROM python:3.11

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY requirements.txt .

# Instala as dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante do projeto
COPY . .

# Expõe a porta usada (não obrigatória, mas boa prática)
EXPOSE 8000

# Comando de execução (usando lógica do main.py)
CMD ["python", "main.py"]
