# Adivimat Accesible

Adivimat Accesible, es una aplicación educativa diseñada para mejorar las 
habilidades matemáticas de los usuarios mediante acertijos matemáticos. Orientada a 
un público diverso, la aplicación promueve el aprendizaje y práctica de conceptos 
matemáticos, adaptándose a diferentes niveles de habilidad. Los usuarios se enfrentarán 
a desafíos que cubren desde la aritmética básica hasta conceptos más complejos como 
el álgebra y la geometría, sin la necesidad de registro, promoviendo un acceso rápido y 
directo al contenido educativo.

## Documentación
[Portada](docs/00-Portada.md)
[Introducción](docs/01-Introduccion.md)
[Presentación](docs/01-Presentacion.md)
[Diagramas de caso de uso](docs/Descripcion-de-Diagramas-caso-de-uso.md)
[Diagrama de la base de datos](docs/DescripcionDiagramaDB.md)
### Importante ver los archivos:
**caso-de-uso-backend.wsd, caso-de-uso-frontend.wsd y DiagramaDB.wsd**
[Tecnologías](docs/02-tecnologias.md)
[Implementación](docs/05-Implementacion.md)
[Conclusiones](docs/06-conclusiones.md)
[Bibliografía](docs/07-bibliografia.md)
## Puesta en marcha

Requisitos: Docker y Node 22.

### 1. Configurar el entorno

```bash
cp .env.example .env
```

Rellena `.env`. Para `JWT_SECRET` genera un valor con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 2. Levantar los contenedores

```bash
docker compose up -d --build
```

Levanta cuatro servicios:

| Servicio        | URL                     | Descripción                        |
| --------------- | ----------------------- | ---------------------------------- |
| `frontend`      | http://localhost:3000   | Cliente web (build de Vite servido por nginx) |
| `backend`       | http://localhost:4000   | API REST (`/health` para comprobar) |
| `mongo`         | localhost:27017         | Base de datos, con volumen persistente |
| `mongo-express` | http://localhost:8082   | Visor web de la base de datos      |

El backend usa el puerto **4000**, no el 3000, porque el 3000 es el del
cliente web.

### 3. Frontend en modo desarrollo (opcional)

`docker compose up` ya sirve el frontend compilado. Para desarrollar con
recarga en caliente, para ese contenedor y levanta Vite:

```bash
docker compose stop frontend
```

```bash
npm run dev:frontend
```

Queda igualmente en http://localhost:3000. La URL de la API se configura con
`VITE_API_URL` en `frontend/adivimat-accesible/.env.local`. En Vite solo las
variables con prefijo `VITE_` llegan al bundle, y se incrustan en tiempo de
compilación, no de ejecución.

## Estructura

```
shared/    Tipos y lógica de dominio compartidos (sin dependencias de plataforma)
backend/   API REST en TypeScript (Express + Mongoose)
frontend/  Cliente web en React + TypeScript (Vite)
```

`shared/` es neutral de plataforma a propósito: no importa `mongoose`, `express`
ni nada del DOM, de modo que la futura app móvil (Expo / React Native) pueda
consumirlo tal cual y reutilizar las reglas del juego sin conexión.

### Desarrollo del backend fuera de Docker

```bash
cp backend/.env.example backend/.env
docker compose up -d mongo
npm run dev --workspace backend
```

Otros comandos útiles, desde la raíz:

```bash
npm run build
```

```bash
npm run typecheck
```

```bash
npm test
```
