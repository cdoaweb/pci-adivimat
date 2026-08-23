import { useCallback, useEffect, useState } from 'react';

import {
  type Progreso,
  type ResultadoPartida,
  deserializarProgreso,
  progresoVacio,
  registrarResultado,
  serializarProgreso,
} from '@adivimat/shared';

/**
 * Progreso del jugador, guardado en el navegador.
 *
 * Se guarda aqui y no en el servidor porque la aplicacion se juega sin cuenta:
 * no hay a quien asociarlo. La logica es de `@adivimat/shared`, asi que la app
 * movil podra reutilizarla cambiando solo el almacen por el suyo.
 */
export const CLAVE_PROGRESO = 'adivimat:progreso';

function leer(): Progreso {
  try {
    return deserializarProgreso(localStorage.getItem(CLAVE_PROGRESO));
  } catch {
    /* localStorage puede lanzar en modo privado o con el almacen deshabilitado.
       Sin progreso se juega igual; sin aplicacion, no. */
    return progresoVacio();
  }
}

function guardar(progreso: Progreso): void {
  try {
    localStorage.setItem(CLAVE_PROGRESO, serializarProgreso(progreso));
  } catch {
    /* Cuota agotada o almacen deshabilitado: la partida continua en memoria. */
  }
}

export interface UseProgreso {
  progreso: Progreso;
  registrar: (adivinanzaId: string, resultado: ResultadoPartida) => void;
  reiniciar: () => void;
}

export function useProgreso(): UseProgreso {
  const [progreso, setProgreso] = useState<Progreso>(leer);

  /* Si se juega en dos pestanas, la que no ha escrito debe enterarse: sin esto,
     la ultima en guardar pisaria la puntuacion de la otra. */
  useEffect(() => {
    const alCambiar = (evento: StorageEvent) => {
      if (evento.key === CLAVE_PROGRESO) {
        setProgreso(deserializarProgreso(evento.newValue));
      }
    };

    window.addEventListener('storage', alCambiar);
    return () => window.removeEventListener('storage', alCambiar);
  }, []);

  const registrar = useCallback((adivinanzaId: string, resultado: ResultadoPartida) => {
    setProgreso((actual) => {
      const siguiente = registrarResultado(actual, adivinanzaId, resultado);
      guardar(siguiente);
      return siguiente;
    });
  }, []);

  const reiniciar = useCallback(() => {
    const vacio = progresoVacio();
    guardar(vacio);
    setProgreso(vacio);
  }, []);

  return { progreso, registrar, reiniciar };
}
