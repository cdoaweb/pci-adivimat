/**
 * Entidades del dominio, tal y como viajan por la API.
 *
 * Son la unica fuente de verdad del contrato: las consumen el backend (al
 * serializar documentos de Mongoose), el frontend web y la futura app Expo.
 * No dependen de mongoose ni de ninguna API de plataforma a proposito.
 */

/** Identificador de una entidad. En el backend es un ObjectId serializado. */
export type Id = string;

/** El autor marca con asterisco las adivinanzas mas exigentes. */
export type Dificultad = 'basica' | 'avanzada';

export interface Adivinanza {
  id: Id;
  /** Numero en el libro original. Sirve para citar la fuente. */
  numero?: number;
  pregunta: string;
  /** Respuesta canonica, la que se muestra al revelarla. */
  respuesta: string;
  /**
   * Otras formas que tambien se dan por buenas.
   *
   * Muchas respuestas del libro son expresiones completas ("mediatriz de un
   * segmento") cuando lo que el jugador teclea es el concepto ("mediatriz").
   * Sin esto el juego seria injugable.
   */
  respuestasAceptadas: string[];
  /**
   * Matiz del libro sobre que aspecto del concepto se pregunta.
   *
   * Distingue adivinanzas con la misma respuesta: tres preguntan por la
   * "bisectriz", una como eje de simetria y otra por distancia.
   */
  pista?: string;
  dificultad: Dificultad;
  /**
   * Cuantos intentos concede esta adivinanza.
   *
   * Es un cupo del contenido, igual para todos, no lo que le queda a nadie.
   * Antes se descontaba sobre este mismo campo, de modo que los fallos de un
   * jugador consumian los intentos de todos los demas y, al agotarse, la
   * respuesta quedaba revelada para siempre en el temario.
   */
  intentos: number;
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
