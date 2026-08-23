import { useCallback, useEffect, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  type Progreso,
  type ResultadoPartida,
  deserializarProgreso,
  progresoVacio,
  registrarResultado,
  serializarProgreso,
} from '@adivimat/shared';

/**
 * Progreso del jugador en el dispositivo.
 *
 * Es el mismo gancho que la web, con una sola diferencia: el almacen. Alli es
 * `localStorage`, sincrono; aqui `AsyncStorage`, asincrono. Las reglas (que los
 * puntos se den una sola vez, como se resume el avance, como se sobrevive a un
 * almacen corrupto) no se reescriben: vienen de `@adivimat/shared`.
 *
 * Esa es la razon de que el paquete compartido no dependa de ninguna API de
 * plataforma.
 */
export const CLAVE_PROGRESO = 'adivimat:progreso';

export interface UseProgreso {
  progreso: Progreso;
  /** true mientras se lee del disco al arrancar. */
  cargando: boolean;
  registrar: (adivinanzaId: string, resultado: ResultadoPartida) => void;
  reiniciar: () => void;
}

export function useProgreso(): UseProgreso {
  const [progreso, setProgreso] = useState<Progreso>(progresoVacio);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vigente = true;

    const cargar = async () => {
      try {
        const bruto = await AsyncStorage.getItem(CLAVE_PROGRESO);
        /* Si el componente se desmonto mientras leiamos, no se toca el estado. */
        if (vigente) setProgreso(deserializarProgreso(bruto));
      } catch {
        /* Almacen ilegible: se empieza de cero en lugar de no arrancar. */
        if (vigente) setProgreso(progresoVacio());
      } finally {
        if (vigente) setCargando(false);
      }
    };

    void cargar();
    return () => {
      vigente = false;
    };
  }, []);

  /* La escritura no se espera: el juego no debe quedarse quieto mientras se
     guarda. Si falla, la partida sigue en memoria. */
  const guardar = useCallback((siguiente: Progreso) => {
    AsyncStorage.setItem(CLAVE_PROGRESO, serializarProgreso(siguiente)).catch(() => {
      /* Sin espacio o almacen deshabilitado. */
    });
  }, []);

  const registrar = useCallback(
    (adivinanzaId: string, resultado: ResultadoPartida) => {
      setProgreso((actual) => {
        const siguiente = registrarResultado(actual, adivinanzaId, resultado);
        guardar(siguiente);
        return siguiente;
      });
    },
    [guardar],
  );

  const reiniciar = useCallback(() => {
    const vacio = progresoVacio();
    guardar(vacio);
    setProgreso(vacio);
  }, [guardar]);

  return { progreso, cargando, registrar, reiniciar };
}
