# El contexto de build es la raiz del repo: el frontend depende del workspace
# @adivimat/shared.

FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
COPY frontend/adivimat-accesible/package.json ./frontend/adivimat-accesible/
RUN npm ci

COPY shared ./shared
COPY frontend/adivimat-accesible ./frontend/adivimat-accesible

# Vite incrusta las VITE_* en el bundle en tiempo de compilacion, no de
# ejecucion: por eso la URL de la API entra como argumento de build.
ARG VITE_API_URL=http://localhost:4000/
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build --workspace shared \
 && npm run build --workspace @adivimat/frontend

FROM nginx:1.27-alpine AS runner
COPY frontend/adivimat-accesible/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/adivimat-accesible/dist /usr/share/nginx/html
EXPOSE 80
