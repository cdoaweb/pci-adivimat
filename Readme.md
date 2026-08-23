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

**Si falla con `querySrv ECONNREFUSED`**, no es un problema de credenciales ni
del filtro de IP: es que el resolvedor DNS propio de Node no consigue leer el
registro SRV, aunque el sistema resuelva ese mismo nombre sin problema (pasa en
Windows). Se arregla apuntando a un DNS publico:

```
DNS_SERVERS=1.1.1.1,8.8.8.8
```

Dentro de Docker no hace falta: el DNS del contenedor resuelve SRV.

## Contenido: las 304 adivinanzas

El temario sale del libro *ADIVIMAT*, de Jose Enrique Fernandez del Campo:
7 temas, 17 subtemas y las 304 adivinanzas con su respuesta.

> **El contenido no se versiona.** `backend/seed/adivinanzas.json` esta en
> `.gitignore`, igual que el PDF. Es obra de su autor y se distribuye aparte;
> el repositorio solo guarda el script que lo extrae. Antes de cargar nada hay
> que generarlo.

Para cargarlo:

```bash
npm run seed --workspace backend
```

Sin `--reset` no hace nada si ya hay temas, para no duplicar el temario. Para
reemplazarlo:

```bash
npm run seed --workspace backend -- --reset
```

El JSON **no se edita a mano** ni se versiona: lo genera
`backend/seed/parse_adivimat.py` a partir del PDF del libro.

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

### Dos formas de responder

El jugador elige, y la preferencia se recuerda entre sesiones:

- **Escribiendo la respuesta.** El modo completo. Un acierto vale 10 puntos.
- **Eligiendo entre cuatro opciones.** Pensado para lectores de pantalla, donde
  teclear "circunferencia circunscrita" es costoso, y para quien esta empezando
  con el temario.

Los senuelos salen de otras adivinanzas **del mismo subtema**: mezclar una
respuesta de geometria en una pregunta de funciones la delataria sin necesidad
de leer el enunciado. Se descartan ademas los senuelos que en realidad son la
respuesta correcta, porque el libro resuelve varias adivinanzas con la misma
palabra ("bisectriz" es la solucion de tres).

En opcion multiple el acierto vale 5 puntos y no 10, y los intentos bajan a 2:
con cuatro opciones a la vista se acierta una de cada cuatro veces por azar, y
conservar cinco intentos permitiria resolverla por descarte sin saber la
respuesta. Las opciones falladas quedan tachadas y desactivadas.

Se usa un grupo de radios y no botones que respondan al pulsar: con un lector de
pantalla, los radios dejan recorrer las opciones con las flechas y oirlas todas
antes de comprometerse.

### Ayudas durante la partida

- Tras el primer fallo aparece el **matiz del libro** (59 adivinanzas lo
  tienen). Es lo que distingue preguntas con la misma respuesta: tres piden
  "bisectriz", una como eje de simetria y otra por distancia.
- Tras el segundo, la **forma de la respuesta**: inicial y numero de letras, o
  cuantas palabras son. Solo en el modo escrito: con las opciones a la vista no
  aporta nada.
- Las 27 que el autor marco con asterisco salen etiquetadas como *avanzada* y
  dan 7 intentos en lugar de 5 (2 en opcion multiple, como el resto).
- Las adivinanzas se reparten **sin repetir** hasta agotar el subtema, y el
  marcador muestra aciertos, puntos y cuantas quedan.

### Puntuacion y progreso

El progreso se guarda **en el dispositivo de quien juega**, no en el servidor.
La aplicacion existe para practicar sin registrarse, asi que no hay cuenta a la
que asociarlo: en web vive en `localStorage` y en la futura app movil vivira en
su propio almacen. La logica esta en `@adivimat/shared`, en funciones puras
sobre un objeto serializable, de modo que cambiar de almacen no toca las reglas.

Se guarda por adivinanza: si esta resuelta, cuantos intentos ha costado y
cuantos puntos ha dado. Los **puntos se conceden una sola vez**: repetir una
adivinanza ya acertada no vuelve a sumar, o el marcador dejaria de significar
nada. Los intentos si se acumulan, porque describen cuanto ha costado.

El reparto prefiere las adivinanzas aun sin resolver, y solo vuelve a repetir
cuando el subtema esta completo. Hay un boton para borrar el progreso, que
pregunta antes porque no hay copia en ningun sitio.

Si el almacenamiento esta corrupto o es de otra version, se empieza de cero en
lugar de fallar: perder la puntuacion es molesto, pero mucho menos que dejar la
aplicacion sin arrancar.

**`POST /api/respuesta` no guarda nada.** Antes descontaba los intentos sobre la
propia adivinanza y hacia `save()`, pero la adivinanza es contenido compartido:
los fallos de un jugador consumian los intentos de todos los demas y, al
agotarse, marcaban la respuesta como revelada para siempre en el temario. El
campo `intentos` de una adivinanza es ahora el **cupo** que concede, igual para
todos, y quien juega lleva la cuenta de los suyos.

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
