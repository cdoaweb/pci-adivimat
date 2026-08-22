import type { Adivinanza, Id, Subtema, Tema, UserPublic } from './domain';

/** Cuerpo de cualquier respuesta de error de la API. */
export interface ApiError {
  message: string;
}

/* ------------------------------------------------------------------ auth -- */

export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * El campo es `token`, no `accessToken`.
 *
 * El frontend leia `accessToken` y guardaba `undefined` en localStorage; este
 * tipo existe para que ese desajuste no vuelva a compilar.
 */
export interface LoginResponse {
  token: string;
  user: UserPublic;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  adminCode: string;
}

export interface RegisterResponse {
  message: string;
  token: string;
  user: UserPublic;
}

/** Payload que viaja dentro del JWT. */
export interface TokenPayload {
  id: Id;
  isAdmin: boolean;
}

/* ------------------------------------------------------- temas/subtemas -- */

export interface CreateTemaRequest {
  tema: string;
}

export type UpdateTemaRequest = Partial<CreateTemaRequest>;

export interface CreateSubtemaRequest {
  name: string;
}

export type UpdateSubtemaRequest = Partial<CreateSubtemaRequest>;

export interface CreateAdivinanzaRequest {
  pregunta: string;
  respuesta: string;
  intentos?: number;
}

export type UpdateAdivinanzaRequest = Partial<CreateAdivinanzaRequest>;

export type TemaResponse = Tema;
export type SubtemaResponse = Subtema;
export type AdivinanzaResponse = Adivinanza;

/* -------------------------------------------------------------- juego --- */

export interface ResponderRequest {
  respuestaUsuario: string;
}

/**
 * Resultado de un intento.
 *
 * `correcta` y `intentosRestantes` van siempre, en lugar de que el cliente
 * tenga que deducir el desenlace parseando el texto de `message`.
 */
export interface ResponderResponse {
  correcta: boolean;
  message: string;
  intentosRestantes: number;
  puntos: number;
  respuestaRevelada: boolean;
  /** Solo presente cuando `respuestaRevelada` es true. */
  respuesta?: string;
}

export interface SiguienteAdivinanzaResponse {
  adivinanza: Adivinanza | null;
  message?: string;
}
