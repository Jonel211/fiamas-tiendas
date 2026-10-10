# ============================================
# Fiamas Backend - Dockerfile para Render
# ============================================

# Etapa 1: Construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos solo los archivos de dependencias primero (mejor cache)
COPY package.json package-lock.json ./

# Instalamos dependencias
RUN npm ci --ignore-scripts

# Copiamos el resto del código
COPY . .

# Etapa 2: Producción (imagen final pequeña)
FROM node:20-alpine

WORKDIR /app

# Creamos usuario no privilegiado por seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S fiamas -u 1001

# Copiamos solo lo necesario desde el builder
COPY --from=builder --chown=fiamas:nodejs /app/package.json /app/package-lock.json ./
COPY --from=builder --chown=fiamas:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=fiamas:nodejs /app/. .

# Cambiamos a usuario no root
USER fiamas

# Puerto por defecto (Render lo sobrescribe con process.env.PORT)
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Comando de inicio
CMD ["node", "server.js"]