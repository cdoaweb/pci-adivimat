# Tecnologías

El proyecto es un **monorepo con npm workspaces** formado por cuatro paquetes:

```
shared/    Tipos y lógica de dominio, sin dependencias de plataforma
backend/   API REST (Node.js + Express + Mongoose)
frontend/  Cliente web (React + Vite)
mobile/    App móvil (React Native + Expo)
```

## Transversal

### TypeScript

- **Qué es**: un superconjunto de JavaScript que añade tipos comprobados antes
  de ejecutar.
- **Por qué lo uso**: el proyecto empezó en JavaScript y se migró entero. El
  motivo no fue estético: con tres clientes distintos (web, móvil y el propio
  backend) hablando la misma API, el contrato tiene que estar escrito en algún
  sitio que el compilador sepa comprobar. Al migrar aparecieron errores que
  llevaban meses en producción, como que el cliente leía `accessToken` donde el
  servidor enviaba `token`, de modo que la sesión nunca se guardaba bien.

### El paquete `shared`

- **Qué es**: un paquete propio del monorepo con los tipos del dominio, el
  contrato de la API, las reglas del juego, las validaciones y el progreso del
  jugador.
- **Por qué lo uso**: es la pieza que evita que la misma regla se escriba tres
  veces y acabe discrepando. Antes ocurría: el modelo comparaba las respuestas
  en minúsculas y la ruta del servidor lo hacía distinguiendo mayúsculas, así
  que la misma respuesta se aceptaba o se rechazaba según por dónde entrase.
- **Restricción**: no importa `mongoose`, ni `express`, ni nada del DOM. Esa
  disciplina es lo que permite que la app móvil lo consuma **sin adaptar una
  sola línea**.

## Back-end

### Node.js y Express

- **Qué son**: entorno de ejecución de JavaScript en el servidor y framework web
  minimalista.
- **Por qué los uso**: permiten montar una API REST con poco código y compartir
  lenguaje con el cliente, lo que hace posible el paquete `shared`.

### MongoDB y Mongoose

- **Qué son**: base de datos NoSQL orientada a documentos y biblioteca de
  modelado sobre ella.
- **Por qué los uso**: el contenido tiene forma de árbol (tema → subtema →
  adivinanza) y encaja de forma natural en documentos anidados. Mongoose añade
  validación de esquema y tipado.
- **MongoDB Atlas**: el mismo código sirve para un Mongo local o para un clúster
  en la nube. Solo cambia `MONGO_URI`.

### JWT

- **Qué es**: un estándar para emitir tokens de acceso firmados.
- **Por qué lo uso**: la autenticación no necesita estado en el servidor. El
  token caduca en una hora, y cuando el servidor lo rechaza el cliente cierra
  sesión y avisa del motivo.

### bcryptjs

- **Qué es**: biblioteca para calcular el hash de las contraseñas.
- **Por qué lo uso**: el proyecto arrastraba `bcrypt` y `bcryptjs` a la vez. Se
  consolidó en `bcryptjs`, que es JavaScript puro: `bcrypt` compila código
  nativo, lo que complica la construcción de la imagen de Docker y no encaja en
  React Native.

### dotenv

- **Qué es**: carga variables de entorno desde un archivo `.env`.
- **Por qué lo uso**: mantiene fuera del repositorio las credenciales y la
  configuración. La configuración se valida al arrancar, de modo que si falta
  una variable el proceso muere diciendo cuál, en lugar de fallar mucho después
  con un error de conexión confuso.

### CORS

- **Qué es**: el mecanismo que decide qué orígenes pueden llamar a la API desde
  un navegador.
- **Por qué lo uso**: el cliente web vive en otro puerto que la API. La lista de
  orígenes permitidos es explícita; antes se aceptaba cualquiera.

### Docker

- **Qué es**: plataforma para empaquetar y ejecutar aplicaciones en
  contenedores.
- **Por qué lo uso**: levanta la aplicación entera con una sola orden y garantiza
  que se comporte igual en cualquier máquina. **[Explicado aquí](03-docker.md)**.

## Estructura del back-end

```
backend/src/
  server.ts          Arranque: conecta a Mongo y abre el puerto
  app.ts             Construye la aplicación de Express sin arrancarla
  config/env.ts      Lee y valida la configuración
  models/
    tema.ts          Tema, Subtema y Adivinanza (documentos anidados)
    user.ts          Usuario
    mappers.ts       Convierte documentos de Mongoose en tipos públicos
  controllers/
    authController.ts   Registro, acceso y estado del alta inicial
    temaController.ts   CRUD de contenido
    juegoController.ts  Endpoints de la partida
  middleware/auth.ts    requireAuth, requireAdmin y autorización del alta
  routes/               Solo enrutan; la lógica está en los controladores
  utils/generateToken.ts
  scripts/seed.ts       Carga el temario en la base de datos
```

Dos decisiones que conviene explicar:

- **Los tres esquemas están en un solo archivo** (`tema.ts`). Antes estaban
  separados y `tema.js` hacía `require('./subtema').schema`, exportando un
  modelo entero solo para leerle el esquema. El orden de definición importa,
  porque cada uno se incrusta en el siguiente, y tenerlos juntos lo hace
  explícito.
- **Los mappers son el único punto de salida.** Todo lo que devuelve la API pasa
  por ellos, que convierten `_id` en `id` y deciden qué campos son visibles. El
  compilador rechaza cualquier campo no declarado en el tipo público, así que un
  hash de contraseña no puede colarse en una respuesta sin que falle la
  compilación.

## Front-end web

### React

- **Qué es**: biblioteca para construir interfaces por composición de
  componentes.
- **Por qué lo uso**: el estado de la aplicación es pequeño y local, y se maneja
  con hooks y **Context API**. No uso Redux: para este tamaño habría sido
  complejidad sin beneficio.

### Vite

- **Qué es**: herramienta de compilación y servidor de desarrollo.
- **Por qué lo uso**: sustituyó a Create React App, que está sin mantenimiento y
  arrastraba las dependencias responsables de casi todos los avisos de seguridad
  del repositorio. **[Explicado aquí](04-react.md)**.

### React Router

- **Qué es**: biblioteca de enrutado para aplicaciones de una sola página.
- **Por qué lo uso**: permite navegar sin recargar y proteger rutas de
  administración.

### Axios

- **Qué es**: cliente HTTP.
- **Por qué lo uso**: los interceptores permiten adjuntar el token en cada
  petición y detectar en un solo sitio que la sesión ha caducado.

### Vitest

- **Qué es**: framework de pruebas integrado con Vite.
- **Por qué lo uso**: sustituye a Jest tras la migración. Las pruebas cubren el
  arranque, la protección de rutas y las reglas de juego compartidas.

### Accesibilidad

- **`aria-live`**: anuncia los cambios de la partida a los lectores de pantalla
  sin robar el foco.
- **Etiquetas asociadas**: cada campo tiene su `<label>`, y los errores se
  enlazan con `aria-describedby` y `aria-invalid`.
- **`role="alert"`**: los errores se anuncian en cuanto aparecen. Antes eran
  `alert()` del navegador, que bloquean el hilo y son incómodos con un lector
  de pantalla.
- **Modo de opción múltiple**: escribir "circunferencia circunscrita" con un
  lector de pantalla es costoso, así que se puede responder eligiendo entre
  cuatro opciones.

## Estructura del front-end web

```
frontend/adivimat-accesible/
  index.html
  vite.config.ts
  src/
    main.tsx              Punto de entrada
    App.tsx               Rutas
    lib/
      api.ts              Cliente HTTP e interceptores
      useProgreso.ts      Progreso sobre localStorage
    context/
      AuthProvider.tsx    Sesión, con acciones tipadas
      ThemeContext.tsx
    Components/
      Home, Login, Logout, Register, About, MenuAppBar, Footer,
      PrivateRoute, Gestion
      selector/           La partida, partida en tres componentes
      crud/               Gestión de temas, subtemas y adivinanzas
    __tests__/
```

## App móvil

### React Native y Expo

- **Qué son**: framework para escribir aplicaciones nativas con React, y
  plataforma que simplifica su desarrollo y distribución.
- **Por qué los uso**: permiten reutilizar el conocimiento de React y, sobre
  todo, el paquete `shared` completo. La app móvil no reescribe ninguna regla
  del juego.

### AsyncStorage

- **Qué es**: almacenamiento clave-valor persistente en el dispositivo.
- **Por qué lo uso**: es el equivalente de `localStorage` en React Native. Es la
  **única** diferencia real entre el progreso de la web y el del móvil: las
  reglas vienen de `shared`, solo cambia dónde se guarda.

### React Navigation

- **Qué es**: biblioteca de navegación entre pantallas.
- **Por qué lo uso**: las rutas están tipadas, de modo que el compilador impide
  navegar a una pantalla sin sus parámetros.

\pagebreak
