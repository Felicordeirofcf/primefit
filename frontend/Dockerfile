# Base leve com suporte completo ao Vite/React
FROM node:20-alpine

# Define diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos de dependência para cache eficiente
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia todo o restante do código
COPY . .

# Gera a versão de produção do app (build Vite)
RUN npm run build

# Instala o `serve` globalmente para servir o app
RUN npm install -g serve

# Expõe a porta correta que será usada externamente
EXPOSE 8080

# Executa o app servindo a pasta dist e escutando em todas as interfaces
CMD ["serve", "-s", "dist", "-l", "0.0.0.0:8080"]
