# El contexto de build es la raiz del repo, no backend/, porque el backend
# depende del workspace @adivimat/shared.

FROM node:22-alpine AS builder
WORKDIR /app

# Primero solo los manifiestos: mientras no cambien, Docker reutiliza la capa
# de node_modules y no reinstala en cada build.
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
RUN npm ci

COPY shared ./shared
COPY backend ./backend
RUN npm run build --workspace shared && npm run build --workspace backend

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
RUN npm ci --omit=dev && npm cache clean --force

# Solo el JavaScript compilado: ni fuentes .ts ni el compilador viajan a la
# imagen final.
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist

USER node
EXPOSE 4000
CMD ["node", "backend/dist/server.js"]
