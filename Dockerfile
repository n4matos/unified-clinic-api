# Etapa 1: Build
FROM node:22.17-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --production=false

COPY . .
RUN npm run build

# Etapa 2: Produção
FROM node:22.17-alpine AS runner

WORKDIR /app

COPY package*.json ./
RUN npm install --production --ignore-scripts --prefer-offline

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/server.js"]
