# Base leve com suporte completo ao Vite/React
FROM node:20-alpine AS builder

# Define diretório de trabalho
WORKDIR /app

# Copia apenas arquivos de dependência para cache eficiente
COPY package*.json ./

# Instala dependências de produção e desenvolvimento
RUN npm install

# Copia o restante da aplicação
COPY . .

# Gera o build de produção (Vite)
RUN npm run build

# ========================
# Fase final: somente os arquivos necessários para rodar o app
# ========================
FROM node:20-alpine AS runner

# Diretório onde o app vai rodar
WORKDIR /app

# Instala somente o `serve` globalmente
RUN npm install -g serve

# Copia apenas os arquivos de build da etapa anterior
COPY --from=builder /app/dist ./dist

# Expõe a porta usada pelo app
EXPOSE 8080

# Executa o app servindo a pasta dist, escutando todas interfaces
CMD ["serve", "-s", "dist", "-l", "0.0.0.0:8080"]
