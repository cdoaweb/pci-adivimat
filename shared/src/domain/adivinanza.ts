import type { Adivinanza } from '../types/domain';
import type { ResponderResponse } from '../types/api';

/**
 * Logica de juego, en funciones puras.
 *
 * Vive aqui, y no en el modelo de Mongoose, porque la app movil necesita
 * evaluar intentos sin conexion. Al no depender de mongoose ni del DOM, el
 * mismo codigo corre en Node, en el navegador y en Hermes (React Native).
 */

/** Puntos que otorga un acierto escribiendo la respuesta. */
export const PUNTOS_POR_ACIERTO = 10;

/**
 * Puntos que otorga un acierto en opcion multiple.
 *
 * Valen la mitad: con cuatro opciones a la vista se acierta una de cada cuatro
 * veces por puro azar, asi que pagarlo igual que escribir la respuesta de
 * memoria falsearia el marcador.
 */
export const PUNTOS_POR_ACIERTO_OPCIONES = 5;

/** Intentos con los que arranca una adivinanza nueva. */
export const INTENTOS_POR_DEFECTO = 5;

/**
 * Normaliza una respuesta antes de compararla.
 *
 * Recorta, colapsa espacios, pasa a minusculas, quita signos de puntuacion,
 * elimina el articulo inicial y suprime las tildes.
 *
 * Lo de las tildes no es un capricho: las respuestas del libro son terminos
 * como "angulo", "circunferencia inscrita" o "sucesion", y exigir que el
 * jugador acierte la acentuacion (o sepa teclearla en un movil) convertiria un
 * acierto en un fallo. Al escribirse tambien la respuesta correcta con tildes,
 * la comparacion sigue siendo justa en ambos sentidos.
 *
 * Unifica, ademas, dos comparaciones que antes discrepaban: el modelo comparaba
 * en minusculas y la ruta `/respuesta` lo hacia sensible a mayusculas, de modo
 * que la misma respuesta se aceptaba o se rechazaba segun el endpoint.
 */
export function normalizarRespuesta(valor: string): string {
  const sinTildes = valor
    .normalize('NFD')
    /* Marcas diacriticas combinantes. La enye se conserva: en espanol "n" y
       "n con virgulilla" son letras distintas y "ano" no es "anno". */
    .replace(/[\u0300-\u0302\u0304-\u036f]/g, '');

  return sinTildes
    .toLowerCase()
    .replace(/[.,;:!?"'()[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(?:el|la|los|las|un|una|unos|unas)\s+/, '');
}

/**
 * Quita la marca de plural de cada palabra.
 *
 * Se usa solo como segunda pasada, si la comparacion exacta ya ha fallado. El
 * libro responde unas veces en singular ("recta") y otras en plural ("rectas
 * paralelas"), segun cuantos elementos hablen en la adivinanza, y el jugador no
 * tiene por que adivinar cual toca.
 */
function sinPlural(valor: string): string {
  return valor
    .split(' ')
    .map((palabra) => {
      if (palabra.length <= 3) return palabra;
      /* "-ces" -> "-z": lapices/lapiz, matrices/matriz. */
      if (palabra.endsWith('ces')) return `${palabra.slice(0, -3)}z`;
      if (palabra.endsWith('es')) return palabra.slice(0, -2);
      if (palabra.endsWith('s')) return palabra.slice(0, -1);
      return palabra;
    })
    .join(' ');
}

/**
 * Indica si `respuestaUsuario` resuelve la adivinanza.
 *
 * Se compara contra la respuesta canonica y contra todas las formas aceptadas,
 * primero tal cual y despues ignorando el numero.
 */
export function esRespuestaCorrecta(
  adivinanza: Pick<Adivinanza, 'respuesta'> & Partial<Pick<Adivinanza, 'respuestasAceptadas'>>,
  respuestaUsuario: string,
): boolean {
  const intento = normalizarRespuesta(respuestaUsuario);
  if (!intento) return false;

  const validas = [adivinanza.respuesta, ...(adivinanza.respuestasAceptadas ?? [])].map(
    normalizarRespuesta,
  );

  if (validas.includes(intento)) return true;

  const intentoSingular = sinPlural(intento);
  return validas.some((valida) => sinPlural(valida) === intentoSingular);
}

/**
 * Estado de una adivinanza dentro de una partida.
 *
 * Vive en quien juega, no en el temario: `intentos` son los que le quedan a
 * este jugador, y `puntos` y `respuestaRevelada` describen su partida.
 */
export interface EstadoAdivinanza {
  respuesta: string;
  respuestasAceptadas?: string[];
  /** Intentos que le quedan al jugador. Nunca negativo. */
  intentos: number;
  /** Puntos conseguidos en esta adivinanza. */
  puntos: number;
  /** true cuando se agotan los intentos y se muestra la solucion. */
  respuestaRevelada: boolean;
}

export interface ResultadoIntento {
  /** Nuevo estado. El de entrada no se modifica. */
  estado: EstadoAdivinanza;
  /** Respuesta lista para devolver al cliente. */
  resultado: ResponderResponse;
}

/**
 * Aplica un intento y devuelve el estado resultante sin mutar la entrada.
 *
 * Reglas:
 * - Sin intentos restantes se revela la respuesta y no se descuenta nada.
 * - Un acierto suma {@link PUNTOS_POR_ACIERTO} y consume un intento.
 * - Un fallo consume un intento; si era el ultimo, revela la respuesta.
 */
export function registrarIntento(
  estado: EstadoAdivinanza,
  respuestaUsuario: string,
  /** Cuanto vale el acierto. Menos en opcion multiple, que es mas facil. */
  puntosPorAcierto: number = PUNTOS_POR_ACIERTO,
): ResultadoIntento {
  if (estado.intentos <= 0) {
    const revelado: EstadoAdivinanza = { ...estado, respuestaRevelada: true };
    return {
      estado: revelado,
      resultado: {
        correcta: false,
        message: 'No quedan mas intentos.',
        intentosRestantes: 0,
        puntos: estado.puntos,
        respuestaRevelada: true,
        respuesta: estado.respuesta,
      },
    };
  }

  const intentosRestantes = estado.intentos - 1;

  if (esRespuestaCorrecta(estado, respuestaUsuario)) {
    const puntos = estado.puntos + puntosPorAcierto;
    return {
      estado: { ...estado, intentos: intentosRestantes, puntos },
      resultado: {
        correcta: true,
        message: 'Respuesta correcta!',
        intentosRestantes,
        puntos,
        respuestaRevelada: estado.respuestaRevelada,
      },
    };
  }

  const respuestaRevelada = intentosRestantes === 0;
  const siguiente: EstadoAdivinanza = {
    ...estado,
    intentos: intentosRestantes,
    respuestaRevelada,
  };

  return {
    estado: siguiente,
    resultado: {
      correcta: false,
      message: respuestaRevelada ? 'No quedan mas intentos.' : 'Respuesta incorrecta',
      intentosRestantes,
      puntos: estado.puntos,
      respuestaRevelada,
      ...(respuestaRevelada ? { respuesta: estado.respuesta } : {}),
    },
  };
}

/* ------------------------------------------------------ opcion multiple -- */

export interface OpcionRespuesta {
  texto: string;
  correcta: boolean;
}

/** Numero de opciones por defecto: la correcta y tres senuelos. */
export const OPCIONES_POR_DEFECTO = 4;

/**
 * En opcion multiple se acorta el margen: con cuatro opciones, conservar los
 * cinco o siete intentos del modo escrito permitiria acertar por descarte sin
 * saber la respuesta.
 */
export const INTENTOS_OPCION_MULTIPLE = 2;

/**
 * Construye las opciones de una pregunta de eleccion multiple.
 *
 * Los senuelos salen de `candidatas`, que deben ser respuestas de adivinanzas
 * del mismo subtema: si se mezclasen respuestas de geometria en una pregunta de
 * funciones, la correcta se distinguiria a simple vista sin leer el enunciado.
 *
 * `aleatorio` se recibe como parametro para poder fijarlo en las pruebas.
 *
 * Devuelve menos opciones de las pedidas si no hay senuelos suficientes, y solo
 * la correcta si no hay ninguno.
 */
export function generarOpciones(
  correcta: string,
  candidatas: readonly string[],
  total: number = OPCIONES_POR_DEFECTO,
  aleatorio: () => number = Math.random,
): OpcionRespuesta[] {
  const claveCorrecta = normalizarRespuesta(correcta);

  /* Se descartan repetidas y las que en realidad son la respuesta correcta: el
     libro resuelve varias adivinanzas con la misma palabra ("bisectriz" es la
     solucion de tres), asi que sin esto podrian aparecer dos opciones validas. */
  const vistas = new Set<string>([claveCorrecta]);
  const senuelos: string[] = [];

  for (const candidata of candidatas) {
    const clave = normalizarRespuesta(candidata);
    if (!clave || vistas.has(clave)) continue;
    vistas.add(clave);
    senuelos.push(candidata);
  }

  /* Barajado de Fisher-Yates sobre una copia: `candidatas` no se toca. */
  for (let i = senuelos.length - 1; i > 0; i -= 1) {
    const j = Math.floor(aleatorio() * (i + 1));
    const a = senuelos[i];
    const b = senuelos[j];
    if (a !== undefined && b !== undefined) {
      senuelos[i] = b;
      senuelos[j] = a;
    }
  }

  const opciones: OpcionRespuesta[] = senuelos
    .slice(0, Math.max(total - 1, 0))
    .map((texto) => ({ texto, correcta: false }));

  opciones.push({ texto: correcta, correcta: true });

  for (let i = opciones.length - 1; i > 0; i -= 1) {
    const j = Math.floor(aleatorio() * (i + 1));
    const a = opciones[i];
    const b = opciones[j];
    if (a !== undefined && b !== undefined) {
      opciones[i] = b;
      opciones[j] = a;
    }
  }

  return opciones;
}
