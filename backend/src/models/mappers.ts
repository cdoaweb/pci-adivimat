import type { Adivinanza, Subtema, Tema, UserPublic } from '@adivimat/shared';

import type { AdivinanzaDoc, SubtemaDoc, TemaDoc } from './tema';
import type { UserDoc } from './user';

/**
 * Traduce documentos de Mongoose a los tipos publicos de `@adivimat/shared`.
 *
 * Todo lo que sale por la API pasa por aqui. Es el punto donde `_id` se
 * convierte en `id` y donde se decide que campos son visibles: el compilador
 * rechaza cualquier campo que no declare el tipo compartido, asi que un hash
 * de contrasena no puede colarse en una respuesta sin que la build falle.
 */

export function toAdivinanza(doc: AdivinanzaDoc): Adivinanza {
  return {
    id: doc._id.toString(),
    pregunta: doc.pregunta,
    respuesta: doc.respuesta,
    intentos: doc.intentos,
    puntos: doc.puntos,
    respuestaRevelada: doc.respuestaRevelada,
  };
}

export function toSubtema(doc: SubtemaDoc): Subtema {
  return {
    id: doc._id.toString(),
    name: doc.name,
    adivinanzas: doc.adivinanzas.map(toAdivinanza),
  };
}

export function toTema(doc: TemaDoc): Tema {
  return {
    id: doc._id.toString(),
    tema: doc.tema,
    subtemas: doc.subtemas.map(toSubtema),
  };
}

export function toUserPublic(doc: UserDoc): UserPublic {
  return {
    id: doc._id.toString(),
    username: doc.username,
    email: doc.email,
    isAdmin: doc.isAdmin,
  };
}
