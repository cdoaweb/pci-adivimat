import { describe, expect, it } from 'vitest';

import { PUNTOS_POR_ACIERTO, esRespuestaCorrecta, registrarIntento } from '@adivimat/shared';

/**
 * La logica de juego se comprueba una sola vez, en el paquete compartido que
 * usan backend, web y (en el futuro) la app movil. Antes cada lado tenia su
 * propia copia y discrepaban entre si.
 */
describe('reglas de juego compartidas', () => {
  const base = { respuesta: 'Cuatro', intentos: 3, puntos: 0, respuestaRevelada: false };

  it('acepta la respuesta con otras mayusculas y espacios sobrantes', () => {
    expect(esRespuestaCorrecta(base, '  CUATRO  ')).toBe(true);
  });

  it('suma puntos al acertar', () => {
    const { resultado } = registrarIntento(base, 'cuatro');
    expect(resultado.correcta).toBe(true);
    expect(resultado.puntos).toBe(PUNTOS_POR_ACIERTO);
  });

  it('revela la respuesta al agotar los intentos', () => {
    let estado = base;
    for (let i = 0; i < 3; i += 1) {
      estado = registrarIntento(estado, 'mal').estado;
    }
    expect(estado.respuestaRevelada).toBe(true);
    expect(estado.intentos).toBe(0);
  });

  it('no muta el estado que recibe', () => {
    registrarIntento(base, 'mal');
    expect(base.intentos).toBe(3);
  });
});
