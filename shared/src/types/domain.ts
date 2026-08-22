/**
 * Entidades del dominio, tal y como viajan por la API.
 *
 * Son la unica fuente de verdad del contrato: las consumen el backend (al
 * serializar documentos de Mongoose), el frontend web y la futura app Expo.
 * No dependen de mongoose ni de ninguna API de plataforma a proposito.
 */

/** Identificador de una entidad. En el backend es un ObjectId serializado. */
export type Id = string;

export interface Adivinanza {
  id: Id;
  pregunta: string;
  respuesta: string;
  /** Intentos que le quedan al usuario. Nunca negativo. */
  intentos: number;
  /** Puntos acumulados en esta adivinanza. Nunca negativo. */
  puntos: number;
  /** Pasa a true cuando se agotan los intentos y se revela la respuesta. */
  respuestaRevelada: boolean;
}

export interface Subtema {
  id: Id;
  name: string;
  adivinanzas: Adivinanza[];
}

export interface Tema {
  id: Id;
  tema: string;
  subtemas: Subtema[];
}

/**
 * Usuario tal y como se expone al cliente.
 *
 * No incluye `password`: el tipo hace imposible filtrar el hash por accidente
 * en una respuesta, porque el compilador rechaza el campo de mas.
 */
export interface UserPublic {
  id: Id;
  username: string;
  email: string;
  isAdmin: boolean;
}
