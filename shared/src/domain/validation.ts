import type { LoginRequest, RegisterRequest } from '../types/api';

/**
 * Validaciones de entrada compartidas por web y movil, para que los dos
 * clientes rechacen exactamente lo mismo antes de llegar a la red.
 */

export const PASSWORD_MIN_LENGTH = 8;
export const USERNAME_MIN_LENGTH = 3;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Errores por campo. Un objeto vacio significa que la entrada es valida. */
export type ErroresValidacion<T> = Partial<Record<keyof T, string>>;

export function esEmailValido(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function validarLogin(entrada: Partial<LoginRequest>): ErroresValidacion<LoginRequest> {
  const errores: ErroresValidacion<LoginRequest> = {};

  if (!entrada.email?.trim()) {
    errores.email = 'El email es obligatorio';
  } else if (!esEmailValido(entrada.email)) {
    errores.email = 'El email no tiene un formato valido';
  }

  if (!entrada.password) {
    errores.password = 'La contrasena es obligatoria';
  }

  return errores;
}

export function validarRegistro(
  entrada: Partial<RegisterRequest>,
  /** true en el alta inicial, donde hace falta el codigo de administrador. */
  exigirAdminCode = false,
): ErroresValidacion<RegisterRequest> {
  const errores: ErroresValidacion<RegisterRequest> = {};

  if (!entrada.username?.trim()) {
    errores.username = 'El nombre de usuario es obligatorio';
  } else if (entrada.username.trim().length < USERNAME_MIN_LENGTH) {
    errores.username = `Minimo ${USERNAME_MIN_LENGTH} caracteres`;
  }

  if (!entrada.email?.trim()) {
    errores.email = 'El email es obligatorio';
  } else if (!esEmailValido(entrada.email)) {
    errores.email = 'El email no tiene un formato valido';
  }

  if (!entrada.password) {
    errores.password = 'La contrasena es obligatoria';
  } else if (entrada.password.length < PASSWORD_MIN_LENGTH) {
    errores.password = `Minimo ${PASSWORD_MIN_LENGTH} caracteres`;
  }

  if (exigirAdminCode && !entrada.adminCode) {
    errores.adminCode = 'El codigo de administrador es obligatorio';
  }

  return errores;
}

/** true si `validarLogin` / `validarRegistro` no encontraron ningun error. */
export function esValido<T>(errores: ErroresValidacion<T>): boolean {
  return Object.keys(errores).length === 0;
}
