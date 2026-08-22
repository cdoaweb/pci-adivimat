import type { Adivinanza } from '../types/domain';
import type { ResponderResponse } from '../types/api';

/**
 * Logica de juego, en funciones puras.
 *
 * Vive aqui, y no en el modelo de Mongoose, porque la app movil necesita
 * evaluar intentos sin conexion. Al no depender de mongoose ni del DOM, el
 * mismo codigo corre en Node, en el navegador y en Hermes (React Native).
 */

/** Puntos que otorga un acierto. */
export const PUNTOS_POR_ACIERTO = 10;

/** Intentos con los que arranca una adivinanza nueva. */
export const INTENTOS_POR_DEFECTO = 5;

/**
 * Normaliza una respuesta antes de compararla: recorta los extremos, colapsa
 * los espacios internos y pasa a minusculas.
 *
 * Unifica dos comparaciones que antes discrepaban: el modelo comparaba en
 * minusculas y la ruta `/respuesta` lo hacia sensible a mayusculas, de modo
 * que la misma respuesta se aceptaba o se rechazaba segun el endpoint.
 */
export function normalizarRespuesta(valor: string): string {
  return valor.trim().replace(/\s+/g, ' ').toLowerCase();
}

/** Indica si `respuestaUsuario` resuelve la adivinanza. */
export function esRespuestaCorrecta(
  adivinanza: Pick<Adivinanza, 'respuesta'>,
  respuestaUsuario: string,
): boolean {
  return normalizarRespuesta(adivinanza.respuesta) === normalizarRespuesta(respuestaUsuario);
}

/** Estado mutable de una adivinanza durante una partida. */
export type EstadoAdivinanza = Pick<
  Adivinanza,
  'respuesta' | 'intentos' | 'puntos' | 'respuestaRevelada'
>;

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
    const puntos = estado.puntos + PUNTOS_POR_ACIERTO;
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
