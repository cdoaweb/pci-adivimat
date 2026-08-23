# Evolución del proyecto

Este documento recoge lo que ha cambiado desde la memoria original de junio de
2024. Los apartados anteriores describen el proyecto tal como se entregó
entonces; aquí está lo que vino después y por qué.

## De JavaScript a TypeScript

El proyecto entero se migró a TypeScript en modo `strict`. La razón no fue
estética: con un cliente web, una app móvil y un backend hablando la misma API,
el contrato tiene que estar escrito en algún sitio que el compilador sepa
comprobar.

La migración sacó a la luz errores que ya estaban en producción:

| Error | Consecuencia |
| --- | --- |
| El cliente leía `accessToken` donde el servidor enviaba `token` | El acceso nunca guardaba la sesión; en `localStorage` quedaba la cadena `"undefined"` |
| `POST /respuesta` cargaba el tema con proyección posicional y hacía `save()` | Mongoose lanzaba `DivergentArrayError` sin capturar y **el proceso moría** en cada respuesta |
| Los borrados usaban `subdoc.remove()` | Método eliminado en Mongoose 7; el proyecto usa la 8 |
| `getAdivinanzas` comparaba `subtema.name` con un id | Nunca encontraba nada y devolvía 500 |
| `const [temas, tema, setTemas] = useState([])` | `useState` devuelve dos elementos: `setTemas` era `undefined` y el componente reventaba |
| Varios componentes leían ids con `useParams()` sin montarse desde una ruta | Las peticiones salían con `undefined` en la URL |
| `MenuAppBar` sacaba `logout` de `state`, donde no estaba | Cerrar sesión lanzaba un TypeError |

Ninguno era difícil de arreglar. El problema era que nadie los había visto.

## El paquete compartido

`shared/` nació de una observación concreta: la comparación de respuestas estaba
escrita dos veces y las dos versiones discrepaban. El modelo comparaba en
minúsculas y la ruta del servidor distinguía mayúsculas, de modo que la misma
respuesta se aceptaba o se rechazaba según por dónde entrase.

Hoy contiene los tipos del dominio, el contrato de la API, las reglas del juego,
las validaciones y el progreso del jugador. La restricción que lo hace útil es
que **no depende de ninguna plataforma**: ni `mongoose`, ni `express`, ni el
DOM. Eso es lo que permitió después que la app móvil lo consumiera sin adaptar
una sola línea.

## De Create React App a Vite

CRA está sin mantenimiento y arrastraba el árbol de dependencias responsable de
casi todos los avisos de seguridad del repositorio. Al retirarlo, `npm audit`
pasó de decenas de vulnerabilidades a cero, y la compilación de producción bajó
a unos 8 segundos. Jest se sustituyó por Vitest.

## Seguridad

Tres agujeros que había que cerrar.

**El CRUD de contenido estaba abierto.** Cualquiera podía crear, editar o borrar
temas sin token. El único middleware de autorización se registraba con
`router.use('/admin', ...)` sobre una ruta que no existía, así que nunca llegaba
a ejecutarse. Ahora las escrituras exigen `requireAdmin`; leer y jugar siguen
siendo públicos, que es la premisa de la aplicación.

**El registro era una puerta abierta.** Bastaba conocer el `ADMIN_CODE` del
`.env`, que valía indefinidamente y para cualquiera. Ahora ese código solo
autoriza el alta del **primer** administrador; a partir de ahí las cuentas las
crea un administrador con su sesión.

**Las credenciales estaban en el repositorio.** El `docker-compose.yml` llevaba
el usuario y la contraseña de Mongo escritos dentro, y el repositorio es
público. Todos los valores salieron a un `.env` ignorado por git.

## Estado de partida y contenido

En la primera versión, la adivinanza guardaba `intentos`, `puntos` y
`respuestaRevelada`, y el servidor los modificaba conforme se jugaba. Pero la
adivinanza es contenido compartido: **los fallos de un jugador consumían los
intentos de todos los demás** y, al agotarse, la respuesta quedaba revelada para
siempre en el temario.

Comprobado antes de arreglarlo: tras tres fallos de un jugador, otro que acababa
de entrar veía la misma adivinanza con 2 intentos en lugar de 5.

Ahora el contenido solo dice cuántos intentos concede, `POST /respuesta` no
escribe nada, y el progreso de cada jugador se guarda en su dispositivo.

## El contenido real

El temario son las **304 adivinanzas** del libro *ADIVIMAT*, de José Enrique
Fernández del Campo, repartidas en 7 temas y 17 subtemas. Se extraen del PDF con
un script (`backend/seed/parse_adivimat.py`) que toma la clasificación del
índice del libro.

**El JSON resultante no se versiona**: es obra de su autor y está en
`.gitignore`, igual que el PDF. El repositorio solo guarda el script que lo
extrae.

## Jugabilidad

Exigir la respuesta literal habría hecho el juego injugable. La corrección
perdona todo lo que no cambia la respuesta: mayúsculas, tildes, puntuación, el
artículo inicial y el número. La eñe sí se respeta, porque `año` no es `ano`.

También se acepta la forma corta cuando el complemento no es lo esencial:
`mediatriz` vale por `mediatriz de un segmento`, pero `límite` no vale por
`límite por la izquierda de una función en un punto`, porque borraría la
diferencia con `... por la derecha`.

Se añadieron ayudas escalonadas (primero el matiz del libro, después la inicial
y el número de letras), un **modo de opción múltiple** pensado para lectores de
pantalla, y un reparto que no repite hasta agotar el subtema.

## MongoDB Atlas

La base de datos salió del compose principal a `docker-compose.local-db.yml`, y
`COMPOSE_FILE` decide si se levanta. Para usar Atlas basta con apuntar
`MONGO_URI` al clúster: mongoose entiende `mongodb+srv://` y negocia TLS por su
cuenta.

Una nota práctica: si la conexión falla con `querySrv ECONNREFUSED`, no es un
problema de credenciales ni del filtro de IP, sino que el resolvedor DNS de Node
no consigue leer el registro SRV aunque el sistema resuelva ese mismo nombre sin
problema. Se arregla con `DNS_SERVERS=1.1.1.1,8.8.8.8`.

## La aplicación móvil

`mobile/` es la app en React Native con Expo, y consume `@adivimat/shared` sin
adaptarlo. Las reglas del juego, la generación de señuelos, la corrección de
respuestas y el progreso son exactamente las mismas funciones que usan la web y
el backend.

Lo único que se reescribe es el almacén del progreso: en web es `localStorage`,
síncrono; en el móvil `AsyncStorage`, asíncrono.

Dos detalles propios del móvil:

- **La URL del backend no puede ser `localhost`**, porque en un teléfono eso es
  el propio teléfono. Se toma de `EXPO_PUBLIC_API_URL` o de la IP de la máquina
  que sirve el paquete de desarrollo, que Expo expone en `hostUri`.
- **Metro necesita configuración para el monorepo.** Y conviene saber que la
  documentación de Expo recomienda `disableHierarchicalLookup`, que aquí
  **rompe** el empaquetado: esa opción solo vale cuando npm ha podido aplanar
  todas las dependencias, y no puede, porque la web usa React 18 y el móvil
  React 19.

## Lo que queda pendiente

- **El progreso es por dispositivo.** Cambiar de móvil o borrar los datos del
  navegador lo pierde. Asociarlo a la cuenta cuando haya sesión sería el
  siguiente paso natural.
- **La API envía la respuesta correcta al cliente**, así que la corrección local
  no es a prueba de trampas. Para un juego educativo es razonable; dejaría de
  serlo si hubiera una clasificación pública.
- **No hay recuperación de contraseña.** Si se pierde el acceso a todas las
  cuentas de administrador, hay que borrar los usuarios desde mongo-express, lo
  que devuelve el sistema al estado de alta inicial.

\pagebreak
