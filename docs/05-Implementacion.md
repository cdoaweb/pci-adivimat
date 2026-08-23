# Implementación

## El paquete compartido

Es la pieza central, así que empiezo por ella. `shared/` contiene los tipos del
dominio y las reglas del juego, y lo consumen el backend, el cliente web y la
app móvil.

```typescript
// shared/src/types/domain.ts
export interface Adivinanza {
  id: Id;
  numero?: number;
  pregunta: string;
  respuesta: string;
  respuestasAceptadas: string[];
  pista?: string;
  dificultad: Dificultad;
  /** Cuántos intentos concede esta adivinanza. Es un cupo, igual para todos. */
  intentos: number;
}
```

Ese comentario sobre `intentos` señala un error de diseño que hubo que corregir.
En la primera versión, la adivinanza guardaba también `puntos` y
`respuestaRevelada`, y el servidor los iba modificando conforme se jugaba. Pero
la adivinanza es **contenido compartido**: los fallos de un jugador consumían
los intentos de todos los demás y, al agotarse, la respuesta quedaba revelada
para siempre en el temario. Comprobado antes de arreglarlo: tras tres fallos de
un jugador, otro que acababa de entrar veía la misma adivinanza con 2 intentos
en lugar de 5.

Ahora el contenido solo dice cuántos intentos concede, y el estado de cada
partida vive en quien juega.

### Corregir las respuestas

Exigir la respuesta literal haría el juego injugable: las soluciones del libro
son términos como "ángulo obtusángulo" o expresiones como "mediatriz de un
segmento".

```typescript
// shared/src/domain/adivinanza.ts
export function normalizarRespuesta(valor: string): string {
  const sinTildes = valor
    .normalize('NFD')
    /* Marcas diacríticas combinantes. La eñe se conserva: en español "n" y "ñ"
       son letras distintas y "año" no es "ano". */
    .replace(/[̀-̂̄-ͯ]/g, '');

  return sinTildes
    .toLowerCase()
    .replace(/[.,;:!?"'()[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(?:el|la|los|las|un|una|unos|unas)\s+/, '');
}
```

Se perdonan mayúsculas, tildes, puntuación, el artículo inicial y el número
(singular o plural). También la forma corta, cuando el complemento no es lo que
distingue la respuesta: `mediatriz` vale por `mediatriz de un segmento`, pero
`límite` no vale por `límite por la izquierda de una función en un punto`,
porque borraría la diferencia con `... por la derecha`.

### Las reglas de la partida

```typescript
export function registrarIntento(
  estado: EstadoAdivinanza,
  respuestaUsuario: string,
  puntosPorAcierto: number = PUNTOS_POR_ACIERTO,
): ResultadoIntento
```

Devuelve un estado nuevo sin modificar el que recibe. Esa pureza es lo que
permite probarlo sin base de datos y reutilizarlo en el móvil sin conexión.

## Back-end

### Configuración validada al arrancar

```typescript
// backend/src/config/env.ts
function requerido(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. Copia .env.example a .env y rellénala.`,
    );
  }
  return valor;
}
```

Antes, `mongoose.connect(process.env.MONGO_URI)` recibía `undefined` cuando
faltaba el `.env`, y el fallo aparecía mucho después como un error de conexión
confuso.

### Modelo de contenido

Tema, subtema y adivinanza viven en un mismo documento. Cada entidad tiene dos
tipos: la forma en crudo (`ITema`) y el documento hidratado (`TemaDoc`), que es
el que tiene `save()`. La distinción importa: llamar a `save()` sobre un objeto
plano no compila.

```typescript
// backend/src/models/tema.ts
export interface ITema {
  tema: string;
  subtemas: ISubtema[];
}

export type TemaDoc = HydratedDocument<
  ITema,
  { subtemas: Types.DocumentArray<ISubtema, SubtemaDoc> }
>;
```

### Autenticación

El registro dejó de ser una puerta abierta. Antes bastaba con conocer un
`ADMIN_CODE` del `.env`, que valía indefinidamente y para cualquiera. Ahora el
sistema tiene dos estados:

```typescript
// backend/src/middleware/auth.ts
export async function autorizarRegistro(req, res, next): Promise<void> {
  if (await hayAdministradores()) {
    requireAdmin(req, res, next);   // ya hay admins: hace falta sesión
    return;
  }
  next();                            // alta inicial: el controlador pedirá el código
}
```

El estado se comprueba **por petición**, no al arrancar, porque cambia justo con
el primer alta. Así el sistema nunca queda bloqueado sin manera de crear el
primer administrador.

Un detalle que importa: cuando un administrador da de alta a otro, la respuesta
**no** incluye token. Si lo incluyera, el cliente cambiaría de sesión y quien
creó la cuenta acabaría dentro de la cuenta nueva.

### Control de acceso

| Operación | Acceso |
| --- | --- |
| Listar temas, subtemas y adivinanzas | Público |
| Jugar | Público |
| Crear, editar o borrar contenido | Solo administradores |

Jugar no requiere cuenta, que es la premisa de la aplicación. Antes tampoco la
requería **escribir**: el único middleware de autorización se registraba con
`router.use('/admin', ...)` sobre una ruta que no existía, así que nunca llegaba
a ejecutarse y cualquiera podía borrar contenido sin token.

## Cliente web

### La sesión, con acciones tipadas

```typescript
// frontend/.../context/AuthProvider.tsx
type AuthAction =
  | { type: 'AUTH_SUCCESS'; payload: { user: UserPublic; token: string } }
  | { type: 'AUTH_FAILED'; payload: string }
  | { type: 'SESION_CADUCADA' }
  | { type: 'LOGOUT' };
```

Esta unión discriminada es lo que hace imposible repetir el error original: el
`dispatch` enviaba `{ user, accessToken }` y el reducer leía `payload.token`, de
modo que `state.token` era permanentemente `undefined` y el token que se
guardaba en `localStorage` era la cadena `"undefined"`.

### Progreso del jugador

Se guarda en el dispositivo, no en el servidor: no hay cuenta a la que
asociarlo.

```typescript
// shared/src/domain/progreso.ts
export function registrarResultado(
  progreso: Progreso,
  adivinanzaId: Id,
  resultado: ResultadoPartida,
  ahora: Date = new Date(),
): Progreso
```

Los puntos se conceden **una sola vez** por adivinanza: sin esa regla, repetir
una acertada daría puntos infinitos. Los intentos sí se acumulan, porque miden
el esfuerzo.

Ante un almacenamiento corrupto o de otra versión se empieza de cero en lugar de
fallar: perder la puntuación es molesto, pero mucho menos que dejar la
aplicación sin arrancar por un `localStorage` manipulado.

## App móvil

La pantalla de la partida no reescribe ninguna regla. Importa exactamente las
mismas funciones que la web:

```typescript
// mobile/src/pantallas/Juego.tsx
import {
  registrarIntento,
  generarOpciones,
  estaResuelta,
  resumirProgreso,
} from '@adivimat/shared';
```

Lo único propio del móvil es el almacén (`AsyncStorage` en vez de
`localStorage`) y cómo se resuelve la dirección del backend, que es el detalle
que más se atraganta: en un teléfono, `localhost` es el propio teléfono.

```typescript
// mobile/src/lib/api.ts
const hostUri = Constants.expoConfig?.hostUri;
const host = hostUri?.split(':')[0];
if (host) return `http://${host}:4000`;
```

`hostUri` es la dirección de la máquina que sirve el paquete de desarrollo, que
está en la misma red que el teléfono.

## Variables de entorno

```
MONGO_URI=mongodb://usuario:contraseña@mongo:27017/adivimat?authSource=admin
JWT_SECRET=(generado con crypto.randomBytes)
JWT_EXPIRES_IN=1h
ADMIN_CODE=(solo para el alta del primer administrador)
PORT=4000
CORS_ORIGINS=http://localhost:3000
```

`.env.example` las documenta todas. El archivo `.env` real está en
`.gitignore`.

\pagebreak
