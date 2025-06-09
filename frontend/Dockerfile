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

# Instala o `serve` para rodar o frontend estático (pré-requisito do preview)
RUN npm install -g serve

# Exponha a porta usada pelo Vite Preview
EXPOSE 4173

# Executa o app com `serve` apontando para o build (dist/)
CMD ["serve", "-s", "dist"]
