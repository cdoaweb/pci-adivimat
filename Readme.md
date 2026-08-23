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

## Control de acceso

| Operacion | Acceso |
| --- | --- |
| Listar temas, subtemas y adivinanzas | Publico |
| Jugar (`/respuesta`, `/siguiente-adivinanza`, `/cambiar-subtema`) | Publico |
| Crear, editar o borrar contenido | Solo administradores |
| Carga masiva (`/cargar-temas`) | Solo administradores |

Jugar no requiere cuenta, que es la premisa de la aplicacion. Todo lo que
escribe exige una cabecera `Authorization: Bearer <token>` de un usuario con
`isAdmin`.

### Altas de administrador

El `ADMIN_CODE` del `.env` sirve **una sola vez**: autoriza el alta del primer
administrador, cuando la base de datos todavia no tiene ninguno. En cuanto
existe uno, el codigo deja de aceptarse y las cuentas nuevas las crea un
administrador con su sesion desde `/register`.

`GET /api/auth/bootstrap` indica en cual de los dos estados esta el sistema, y
el formulario se adapta solo: pide el codigo en el alta inicial y lo oculta
despues.

Al dar de alta a otro administrador no se devuelve token, para que la sesion de
quien crea la cuenta siga intacta. En el alta inicial si, para poder entrar sin
un segundo paso.

Si se pierde el acceso a todas las cuentas de administrador, no hay forma de
recuperarlo desde la aplicacion: hay que borrar los usuarios desde
mongo-express, lo que devuelve el sistema al estado de alta inicial.

El token caduca en `JWT_EXPIRES_IN` (1 hora por defecto); cuando el servidor lo
rechaza, el cliente cierra la sesion y lleva al formulario de acceso avisando de
que ha caducado.

## Base de datos

El destino lo fija `MONGO_URI`. Hay dos modos y se eligen con `COMPOSE_FILE` en
el `.env`.

### Mongo en local (por defecto)

```
COMPOSE_FILE=docker-compose.yml:docker-compose.local-db.yml
```

Levanta tambien `mongo` y `mongo-express`.

### MongoDB Atlas

1. En el `.env`, deja solo el compose de la aplicacion:

   ```
   COMPOSE_FILE=docker-compose.yml
   ```

2. Apunta `MONGO_URI` a tu cluster, **con el nombre de la base de datos** antes
   de la interrogacion:

   ```
   MONGO_URI=mongodb+srv://usuario:password@cluster.xxxxx.mongodb.net/adivimat?retryWrites=true&w=majority
   ```

   Si la password contiene `@ : / ? # [ ] %`, hay que codificarla en porcentaje.

3. En Atlas, **Network Access**: autoriza la IP desde la que se conecta el
   backend. Es el fallo mas comun; sin ella la conexion agota el tiempo de
   espera sin un mensaje claro.

4. Carga el temario (ver mas abajo).

No hace falta tocar codigo: mongoose entiende `mongodb+srv://` y negocia TLS por
su cuenta.

## Contenido: las 304 adivinanzas

El temario sale del libro *ADIVIMAT*, de Jose Enrique Fernandez del Campo, y
esta en `backend/seed/adivinanzas.json`: 7 temas, 17 subtemas y las 304
adivinanzas con su respuesta.

Para cargarlo:

```bash
npm run seed --workspace backend
```

Sin `--reset` no hace nada si ya hay temas, para no duplicar el temario. Para
reemplazarlo:

```bash
npm run seed --workspace backend -- --reset
```

El JSON **no se edita a mano**: lo genera `backend/seed/parse_adivimat.py` a
partir del PDF del libro.

```bash
pdftotext -layout -enc UTF-8 advm.pdf advm.txt
```

```bash
python backend/seed/parse_adivimat.py advm.txt backend/seed/adivinanzas.json
```

### Como se corrigen las respuestas

Exigir la respuesta literal haria el juego injugable: las soluciones del libro
son terminos como "angulo obtusangulo" o expresiones completas como "mediatriz
de un segmento". Se aceptan por tanto:

- **Sin distinguir mayusculas, tildes ni puntuacion.** `SEGMÉNTO.` vale por
  `segmento`. Exigir la acentuacion correcta (o saber teclearla en un movil)
  convertiria un acierto en un fallo.
- **Sin el articulo inicial.** `el segmento` vale por `segmento`.
- **En singular o en plural.** El libro responde unas veces en singular y otras
  en plural, segun cuantos elementos hablen en la adivinanza.
- **La forma corta**, cuando el complemento no es lo que distingue la respuesta:
  `mediatriz` vale por `mediatriz de un segmento`. No se acepta cuando ese
  complemento es justo lo esencial: `limite` no vale por `limite por la
  izquierda de una funcion en un punto`, porque borraria la diferencia con
  `... por la derecha`.

La enye si se respeta: `ano` no es `año`.

### Ayudas durante la partida

- Tras el primer fallo aparece el **matiz del libro** (59 adivinanzas lo
  tienen). Es lo que distingue preguntas con la misma respuesta: tres piden
  "bisectriz", una como eje de simetria y otra por distancia.
- Tras el segundo, la **forma de la respuesta**: inicial y numero de letras, o
  cuantas palabras son.
- Las 27 que el autor marco con asterisco salen etiquetadas como *avanzada* y
  dan 7 intentos en lugar de 5.
- Las adivinanzas se reparten **sin repetir** hasta agotar el subtema, y el
  marcador muestra aciertos, puntos y cuantas quedan.

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
