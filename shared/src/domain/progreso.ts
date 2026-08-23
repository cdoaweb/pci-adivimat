import type { Id } from '../types/domain';

/**
 * Progreso del jugador.
 *
 * Se guarda del lado de quien juega, no en el temario. La aplicacion existe
 * para practicar sin registrarse, asi que no hay cuenta a la que asociarlo: en
 * web vive en localStorage y en la app movil vivira en su propio almacen. Por
 * eso este modulo son funciones puras sobre un objeto serializable, sin tocar
 * ninguna API de plataforma.
 *
 * Todas las operaciones devuelven un objeto nuevo; el recibido no se modifica.
 */

/** Version del formato guardado. Sube cuando la forma deje de ser compatible. */
export const VERSION_PROGRESO = 1;

export interface ProgresoAdivinanza {
  /** true en cuanto se acierta, aunque despues se vuelva a jugar. */
  resuelta: boolean;
  /** Intentos gastados en total, sumando todas las veces que se ha jugado. */
  intentosUsados: number;
  /** Puntos conseguidos. Solo se otorgan la primera vez que se acierta. */
  puntos: number;
  /** Fecha ISO del ultimo intento. */
  fecha: string;
}

export interface Progreso {
  version: number;
  adivinanzas: Record<Id, ProgresoAdivinanza>;
}

export interface ResumenProgreso {
  /** Adivinanzas acertadas alguna vez. */
  resueltas: number;
  /** Adivinanzas con al menos un intento. */
  intentadas: number;
  puntos: number;
}

export function progresoVacio(): Progreso {
  return { version: VERSION_PROGRESO, adivinanzas: {} };
}

export interface ResultadoPartida {
  acertada: boolean;
  /** Intentos gastados en esta ronda. */
  intentosUsados: number;
  /** Puntos que corresponderian por acertarla. */
  puntos: number;
}

/**
 * Anota el resultado de una adivinanza.
 *
 * Los puntos se conceden **una sola vez** por adivinanza: sin esa regla,
 * repetir la misma acertandola daria puntos infinitos y el marcador dejaria de
 * significar nada. Los intentos, en cambio, se acumulan, porque describen
 * cuanto ha costado.
 *
 * `ahora` se recibe como parametro para poder fijarlo en las pruebas.
 */
export function registrarResultado(
  progreso: Progreso,
  adivinanzaId: Id,
  resultado: ResultadoPartida,
  ahora: Date = new Date(),
): Progreso {
  const previo = progreso.adivinanzas[adivinanzaId];
  const yaResuelta = previo?.resuelta ?? false;

  const entrada: ProgresoAdivinanza = {
    resuelta: yaResuelta || resultado.acertada,
    intentosUsados: (previo?.intentosUsados ?? 0) + resultado.intentosUsados,
    puntos: (previo?.puntos ?? 0) + (resultado.acertada && !yaResuelta ? resultado.puntos : 0),
    fecha: ahora.toISOString(),
  };

  return {
    version: progreso.version,
    adivinanzas: { ...progreso.adivinanzas, [adivinanzaId]: entrada },
  };
}

/**
 * Resume el progreso.
 *
 * Con `ids` se limita a esas adivinanzas, que es como se calcula el avance de
 * un subtema concreto. Sin ellos, resume todo.
 */
export function resumirProgreso(progreso: Progreso, ids?: readonly Id[]): ResumenProgreso {
  const entradas = ids
    ? ids.map((id) => progreso.adivinanzas[id]).filter((e): e is ProgresoAdivinanza => Boolean(e))
    : Object.values(progreso.adivinanzas);

  return entradas.reduce<ResumenProgreso>(
    (acc, entrada) => ({
      resueltas: acc.resueltas + (entrada.resuelta ? 1 : 0),
      intentadas: acc.intentadas + 1,
      puntos: acc.puntos + entrada.puntos,
    }),
    { resueltas: 0, intentadas: 0, puntos: 0 },
  );
}

/** true si esa adivinanza ya se acerto alguna vez. */
export function estaResuelta(progreso: Progreso, adivinanzaId: Id): boolean {
  return progreso.adivinanzas[adivinanzaId]?.resuelta ?? false;
}

/** Ids ya resueltos de entre los indicados. Sirve para repartir primero lo pendiente. */
export function idsResueltos(progreso: Progreso, ids: readonly Id[]): Id[] {
  return ids.filter((id) => estaResuelta(progreso, id));
}

export function serializarProgreso(progreso: Progreso): string {
  return JSON.stringify(progreso);
}

/**
 * Lee el progreso guardado.
 *
 * Nunca lanza: ante datos corruptos, de otra version o de otra forma, devuelve
 * un progreso vacio. Perder la puntuacion es molesto, pero mucho menos que
 * dejar la aplicacion sin arrancar por un localStorage manipulado.
 */
export function deserializarProgreso(bruto: string | null | undefined): Progreso {
  if (!bruto) return progresoVacio();

  let datos: unknown;
  try {
    datos = JSON.parse(bruto);
  } catch {
    return progresoVacio();
  }

  if (typeof datos !== 'object' || datos === null) return progresoVacio();

  const { version, adivinanzas } = datos as Partial<Progreso>;
  if (version !== VERSION_PROGRESO) return progresoVacio();
  if (typeof adivinanzas !== 'object' || adivinanzas === null) return progresoVacio();

  /* Se filtra entrada a entrada: una sola mal formada no debe tirar el resto. */
  const limpias: Record<Id, ProgresoAdivinanza> = {};
  for (const [id, valor] of Object.entries(adivinanzas)) {
    const e = valor as Partial<ProgresoAdivinanza> | null;
    if (
      e &&
      typeof e.resuelta === 'boolean' &&
      typeof e.intentosUsados === 'number' &&
      typeof e.puntos === 'number' &&
      typeof e.fecha === 'string' &&
      Number.isFinite(e.intentosUsados) &&
      Number.isFinite(e.puntos)
    ) {
      limpias[id] = {
        resuelta: e.resuelta,
        intentosUsados: Math.max(0, e.intentosUsados),
        puntos: Math.max(0, e.puntos),
        fecha: e.fecha,
      };
    }
  }

  return { version: VERSION_PROGRESO, adivinanzas: limpias };
}
