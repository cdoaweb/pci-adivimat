# El contexto de build es la raiz del repo, no backend/, porque el backend
# depende del workspace @adivimat/shared.

FROM node:22-alpine AS builder
WORKDIR /app

# Primero solo los manifiestos: mientras no cambien, Docker reutiliza la capa
# de node_modules y no reinstala en cada build.
#
# El del frontend se copia aunque su codigo no entre en esta imagen: `npm ci`
# valida el lock contra todos los workspaces declarados en la raiz y falla si
# falta alguno. El install se acota con --workspace para no traer react ni mui.
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
COPY frontend/adivimat-accesible/package.json ./frontend/adivimat-accesible/

# Los reintentos amplios estan por el registry, que corta conexiones
# (ECONNRESET) al descargar desde dentro del contenedor.
RUN npm ci --workspace shared --workspace backend --include-workspace-root \
      --fetch-retries=5 \
      --fetch-retry-mintimeout=20000 \
      --fetch-retry-maxtimeout=180000 \
      --fetch-timeout=600000

COPY shared ./shared
COPY backend ./backend
RUN npm run build --workspace shared && npm run build --workspace backend

# Se poda en vez de reinstalar: `npm prune` trabaja sobre el arbol ya
# descargado y no toca la red, mientras que el `npm ci --omit=dev` que habia
# aqui repetia la descarga entera en la imagen final y era donde el registry
# cortaba la conexion.
RUN npm prune --omit=dev --workspace shared --workspace backend --include-workspace-root

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# node_modules trae los enlaces simbolicos de los workspaces
# (@adivimat/shared -> ../../shared), por eso hay que recrear tambien la carpeta
# shared con su manifiesto y su dist.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/shared/package.json ./shared/package.json
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/package.json ./backend/package.json

# Solo el JavaScript compilado: ni fuentes .ts ni el compilador viajan a la
# imagen final.
COPY --from=builder /app/backend/dist ./backend/dist

# El temario, para poder cargarlo desde el contenedor:
#   docker compose exec backend node backend/dist/scripts/seed.js --reset
COPY --from=builder /app/backend/seed ./backend/seed

USER node
EXPOSE 4000
CMD ["node", "backend/dist/server.js"]
