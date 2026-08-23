# El cliente web: React, TypeScript y Vite

## Requisitos previos

1. **Node.js 22**, para compilar y empaquetar. Se descarga de
   [nodejs.org](https://nodejs.org/).
2. **npm**, que viene incluido con Node.js.
3. **Docker**, si se quiere levantar la base de datos y la API en local.

## Instalación

El proyecto es un **monorepo con npm workspaces**, así que las dependencias de
todos los paquetes se instalan de una vez desde la raíz. No hay que entrar en
`frontend/` a instalar nada por separado.

```bash
git clone https://github.com/cdoaweb/pci-adivimat.git
```

```bash
cd pci-adivimat && npm install
```

## De Create React App a Vite

El proyecto empezó con **Create React App** (`react-scripts`). Se migró a
**Vite** por dos motivos:

1. **CRA está sin mantenimiento.** Arrastraba un árbol de dependencias
   deprecadas que era la fuente de la mayoría de los avisos de seguridad del
   repositorio. Al retirarlo, `npm audit` pasó de decenas de vulnerabilidades a
   cero.
2. **Velocidad.** La compilación de producción bajó a unos 8 segundos.

Los cambios que implicó la migración:

| Create React App | Vite |
| --- | --- |
| `public/index.html` con `%PUBLIC_URL%` | `index.html` en la raíz del paquete |
| `src/index.js` | `src/main.tsx`, referenciado desde el HTML |
| `process.env.REACT_APP_*` | `import.meta.env.VITE_*` |
| Jest | Vitest |
| `npm start` | `npm run dev` |

Solo las variables con prefijo `VITE_` llegan al paquete final, y se incrustan
**en tiempo de compilación**, no de ejecución: cambiar la URL de la API exige
volver a compilar.

## Dependencias

```json
"dependencies": {
  "@adivimat/shared": "1.0.0",
  "@emotion/react": "^11.11.4",
  "@emotion/styled": "^11.11.5",
  "@mui/material": "^5.15.18",
  "axios": "^1.8.2",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^7.18.2"
}
```

`@adivimat/shared` es el paquete propio del monorepo: contiene los tipos del
dominio, las reglas del juego y el progreso del jugador. Lo consumen el
backend, este cliente y la app móvil.

## Ejecutar la aplicación

Con la API y la base de datos levantadas:

```bash
docker compose up -d
```

Eso ya sirve el cliente compilado en http://localhost:3000. Para desarrollar con
recarga en caliente, se para ese contenedor y se levanta Vite:

```bash
docker compose stop frontend
```

```bash
npm run dev:frontend
```

La URL de la API se configura en `frontend/adivimat-accesible/.env.local`:

```
VITE_API_URL=http://localhost:4000/
```

## Comprobaciones

```bash
npm run typecheck
```

```bash
npm test
```

TypeScript está en modo `strict`, con `noUncheckedIndexedAccess` y
`noUnusedLocals` activados. Los tests usan Vitest con Testing Library, y cubren
el arranque de la aplicación, la protección de rutas y las reglas de juego
compartidas.

\pagebreak
