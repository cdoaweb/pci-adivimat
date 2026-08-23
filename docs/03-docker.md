# Docker

Toda la aplicación se levanta con Docker: la API, el cliente web, la base de
datos y un visor para inspeccionarla.

## Dos archivos de compose

La configuración está partida en dos, y la razón es que la base de datos dejó de
ser obligatoria: el proyecto puede apuntar a un clúster de **MongoDB Atlas** en
lugar de a un Mongo local.

| Archivo | Qué contiene |
| --- | --- |
| `docker-compose.yml` | La aplicación: `backend` y `frontend` |
| `docker-compose.local-db.yml` | La base de datos local: `mongo` y `mongo-express` |

El `.env` los encadena con `COMPOSE_FILE`, de modo que `docker compose up -d`
funciona en los dos casos sin escribir banderas:

```
COMPOSE_PATH_SEPARATOR=:
COMPOSE_FILE=docker-compose.yml:docker-compose.local-db.yml
```

Para usar Atlas basta con dejar solo `docker-compose.yml` en esa variable y
apuntar `MONGO_URI` al clúster.

`COMPOSE_PATH_SEPARATOR` se fija a propósito: su valor por defecto es `;` en
Windows y `:` en Linux y macOS, así que sin declararlo el mismo `.env` no
serviría en las dos plataformas.

## Los servicios

```bash
docker compose up -d --build
```

| Servicio | URL | Descripción |
| --- | --- | --- |
| `frontend` | http://localhost:3000 | Cliente web compilado con Vite y servido por nginx |
| `backend` | http://localhost:4000 | API REST (`/health` para comprobarla) |
| `mongo` | localhost:27017 | Base de datos, con volumen persistente |
| `mongo-express` | http://localhost:8082 | Visor web de la base de datos |

Tres detalles de esos puertos:

- El backend usa el **4000** y no el 3000, que es el del cliente web. Antes
  ambos pedían el 3000 y solo funcionaba por casualidad, porque el servidor de
  desarrollo se apartaba al 3001 al encontrarlo ocupado.
- `mongo-express` usa el **8082** y no el 8081, que suele estar ocupado por
  otros proyectos.
- Mongo declara un **volumen**. La primera versión no lo tenía, así que los
  datos se perdían con cada `docker compose down`.

## Las credenciales salen del repositorio

La primera versión de este archivo llevaba el usuario y la contraseña de Mongo
escritos dentro, y ese archivo se subía a un repositorio público. Ahora todos
los valores vienen de un `.env` que está en `.gitignore`:

```yaml
environment:
  MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USERNAME}
  MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
```

`.env.example` documenta cada variable con un valor de ejemplo. Se copia y se
rellena:

```bash
cp .env.example .env
```

## Arranque ordenado

El backend no arranca hasta que Mongo acepta conexiones, y el frontend no
arranca hasta que el backend responde:

```yaml
depends_on:
  mongo:
    condition: service_healthy
```

`service_healthy` espera al `healthcheck`, no solo a que el contenedor exista.
Sin eso el backend moría al intentar conectar contra una base de datos que
todavía estaba iniciándose.

## Las imágenes

Ambas usan construcción **multietapa**: se compila en una imagen con todas las
herramientas y solo el resultado viaja a la imagen final.

- **Backend**: compila TypeScript y copia a la imagen final únicamente el
  JavaScript resultante, sin fuentes `.ts` ni compilador. Las dependencias se
  instalan una sola vez y se podan con `npm prune --omit=dev`, que trabaja sobre
  el árbol ya descargado. Antes se reinstalaban en la etapa final, lo que
  duplicaba la descarga y era donde el registro de npm cortaba la conexión.
- **Frontend**: compila con Vite y sirve el resultado con **nginx**, que incluye
  `try_files ... /index.html` para que recargar una ruta del cliente devuelva la
  aplicación y no un 404.

El contexto de construcción de ambas es la **raíz del repositorio**, no su
propia carpeta, porque las dos dependen del paquete compartido `shared/`.

## Comprobar que está todo bien

```bash
docker compose ps
```

Los cuatro servicios deben aparecer como `healthy`. Si el backend no lo está:

```bash
docker compose logs backend
```

\pagebreak
