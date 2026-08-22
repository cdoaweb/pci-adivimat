import jwt from 'jsonwebtoken';

import type { TokenPayload } from '@adivimat/shared';

import { config } from '../config/env';

/**
 * Firma un JWT con el payload compartido.
 *
 * `TokenPayload` es el mismo tipo que usa el cliente al decodificar el token,
 * asi que emisor y consumidor no pueden desincronizarse.
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
}

/**
 * Verifica un token y devuelve su payload, o `null` si es invalido o expiro.
 *
 * Devolver `null` en vez de propagar la excepcion obliga a quien llama a
 * contemplar el caso: con `strict` activado, usar el resultado sin comprobarlo
 * no compila.
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as TokenPayload;
  } catch {
    return null;
  }
}
