import { describe, expect, it } from 'vitest';

import {
  PUNTOS_POR_ACIERTO,
  esRespuestaCorrecta,
  generarOpciones,
  registrarIntento,
} from '@adivimat/shared';

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

/**
 * Como se corrigen las respuestas.
 *
 * Las soluciones del libro son terminos como "angulo obtusangulo" o
 * expresiones completas como "mediatriz de un segmento". Exigirlas al pie de la
 * letra haria el juego injugable, asi que la comparacion perdona todo lo que no
 * cambia la respuesta.
 */
describe('correccion de respuestas', () => {
  const angulo = { respuesta: 'angulo recto' };

  it('ignora mayusculas, tildes, articulo y puntuacion', () => {
    for (const intento of ['ANGULO RECTO', '  el ángulo recto ', 'Angulo recto.']) {
      expect(esRespuestaCorrecta(angulo, intento)).toBe(true);
    }
  });

  it('acepta el singular por el plural y al reves', () => {
    expect(esRespuestaCorrecta({ respuesta: 'rectas paralelas' }, 'recta paralela')).toBe(true);
    expect(esRespuestaCorrecta({ respuesta: 'recta' }, 'rectas')).toBe(true);
    expect(esRespuestaCorrecta({ respuesta: 'mediatriz' }, 'mediatrices')).toBe(true);
  });

  it('acepta la forma corta cuando la adivinanza la declara', () => {
    const n9 = {
      respuesta: 'mediatriz de un segmento',
      respuestasAceptadas: ['mediatriz', 'mediatriz de un segmento'],
    };
    expect(esRespuestaCorrecta(n9, 'mediatriz')).toBe(true);
  });

  it('no acepta la forma corta cuando el complemento es lo esencial', () => {
    // La 272 y la 273 solo se distinguen por "izquierda"/"derecha", asi que el
    // generador no les asigna forma corta y "limite" a secas no vale.
    const n272 = {
      respuesta: 'limite por la izquierda de una funcion en un punto',
      respuestasAceptadas: ['limite por la izquierda de una funcion en un punto'],
    };
    expect(esRespuestaCorrecta(n272, 'limite')).toBe(false);
  });

  it('rechaza respuestas distintas, vacias o solo espacios', () => {
    for (const intento of ['angulo agudo', '', '   ']) {
      expect(esRespuestaCorrecta(angulo, intento)).toBe(false);
    }
  });

  it('respeta la enye: "ano" no es "año"', () => {
    expect(esRespuestaCorrecta({ respuesta: 'año' }, 'ano')).toBe(false);
    expect(esRespuestaCorrecta({ respuesta: 'año' }, 'AÑO')).toBe(true);
  });
});

/**
 * Opcion multiple.
 *
 * `aleatorio` se inyecta para que el resultado no dependa del azar y las
 * pruebas no fallen de vez en cuando.
 */
describe('opciones de eleccion multiple', () => {
  const fijo = () => 0.5;
  const pool = ['recta', 'punto', 'segmento', 'semirrecta', 'mediatriz', 'bisectriz'];

  it('devuelve el numero pedido, con una sola correcta y sin repetir', () => {
    const opciones = generarOpciones('recta', pool, 4, fijo);
    expect(opciones).toHaveLength(4);
    expect(opciones.filter((o) => o.correcta)).toHaveLength(1);
    expect(opciones.find((o) => o.correcta)?.texto).toBe('recta');
    expect(new Set(opciones.map((o) => o.texto)).size).toBe(4);
  });

  it('descarta senuelos que en realidad son la respuesta correcta', () => {
    // El libro resuelve tres adivinanzas con "bisectriz": sin este filtro
    // podrian aparecer dos opciones validas en la misma pregunta.
    const opciones = generarOpciones(
      'bisectriz',
      ['bisectriz', 'BISECTRIZ', 'la bisectriz', 'recta', 'punto'],
      4,
      fijo,
    );
    const validas = opciones.filter((o) =>
      esRespuestaCorrecta({ respuesta: 'bisectriz' }, o.texto),
    );
    expect(validas).toHaveLength(1);
  });

  it('no inventa opciones cuando faltan senuelos', () => {
    expect(generarOpciones('recta', [], 4, fijo)).toHaveLength(1);
    expect(generarOpciones('recta', ['punto'], 4, fijo)).toHaveLength(2);
  });

  it('no muta la lista de candidatas', () => {
    const copia = [...pool];
    generarOpciones('recta', copia, 4, fijo);
    expect(copia).toEqual(pool);
  });

  it('coloca la correcta en posiciones distintas', () => {
    const posiciones = new Set(
      Array.from({ length: 60 }, () =>
        generarOpciones('recta', pool, 4).findIndex((o) => o.correcta),
      ),
    );
    expect(posiciones.size).toBeGreaterThan(1);
  });
});
