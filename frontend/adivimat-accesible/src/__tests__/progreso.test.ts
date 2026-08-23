import { describe, expect, it } from 'vitest';

import {
  type Progreso,
  deserializarProgreso,
  estaResuelta,
  progresoVacio,
  registrarResultado,
  resumirProgreso,
  serializarProgreso,
} from '@adivimat/shared';

/**
 * Progreso del jugador.
 *
 * Se guarda en el dispositivo porque la aplicacion se juega sin cuenta. Las
 * funciones son puras, asi que se prueban sin tocar localStorage.
 */
describe('progreso del jugador', () => {
  const ahora = new Date('2026-01-01T10:00:00.000Z');
  const acierto = { acertada: true, intentosUsados: 2, puntos: 10 };

  it('anota el acierto con sus puntos e intentos', () => {
    const p = registrarResultado(progresoVacio(), 'a1', acierto, ahora);
    expect(resumirProgreso(p)).toEqual({ resueltas: 1, intentadas: 1, puntos: 10 });
    expect(estaResuelta(p, 'a1')).toBe(true);
  });

  it('no vuelve a dar puntos por una adivinanza ya resuelta', () => {
    // Sin esta regla, repetir la misma acertandola daria puntos infinitos.
    let p = registrarResultado(progresoVacio(), 'a1', acierto, ahora);
    p = registrarResultado(p, 'a1', acierto, ahora);
    p = registrarResultado(p, 'a1', acierto, ahora);
    expect(resumirProgreso(p).puntos).toBe(10);
    // Los intentos si se acumulan: describen cuanto ha costado.
    expect(p.adivinanzas.a1?.intentosUsados).toBe(6);
  });

  it('anota los fallos sin puntos, y sigue contando como intentada', () => {
    const p = registrarResultado(
      progresoVacio(),
      'a1',
      { acertada: false, intentosUsados: 5, puntos: 0 },
      ahora,
    );
    expect(resumirProgreso(p)).toEqual({ resueltas: 0, intentadas: 1, puntos: 0 });
  });

  it('conserva la resolucion aunque despues se falle', () => {
    let p = registrarResultado(progresoVacio(), 'a1', acierto, ahora);
    p = registrarResultado(p, 'a1', { acertada: false, intentosUsados: 1, puntos: 0 }, ahora);
    expect(estaResuelta(p, 'a1')).toBe(true);
  });

  it('resume solo las adivinanzas indicadas, para el avance por subtema', () => {
    let p = registrarResultado(progresoVacio(), 'a1', acierto, ahora);
    p = registrarResultado(p, 'b1', acierto, ahora);
    expect(resumirProgreso(p, ['a1'])).toEqual({ resueltas: 1, intentadas: 1, puntos: 10 });
    expect(resumirProgreso(p, ['zzz'])).toEqual({ resueltas: 0, intentadas: 0, puntos: 0 });
  });

  it('no modifica el progreso que recibe', () => {
    const original = progresoVacio();
    registrarResultado(original, 'a1', acierto, ahora);
    expect(original.adivinanzas).toEqual({});
  });

  it('sobrevive a un almacenamiento corrupto en lugar de romper la aplicacion', () => {
    for (const basura of [null, '', 'no es json', '{}', '[]', '{"version":99,"adivinanzas":{}}']) {
      expect(deserializarProgreso(basura)).toEqual(progresoVacio());
    }
  });

  it('descarta solo las entradas mal formadas, no todo el progreso', () => {
    const mezcla = JSON.stringify({
      version: 1,
      adivinanzas: {
        buena: { resuelta: true, intentosUsados: 1, puntos: 10, fecha: ahora.toISOString() },
        mala: { resuelta: 'si', puntos: null },
      },
    });
    const p = deserializarProgreso(mezcla);
    expect(Object.keys(p.adivinanzas)).toEqual(['buena']);
  });

  it('sobrevive a una ida y vuelta por texto', () => {
    const p: Progreso = registrarResultado(progresoVacio(), 'a1', acierto, ahora);
    expect(deserializarProgreso(serializarProgreso(p))).toEqual(p);
  });
});
