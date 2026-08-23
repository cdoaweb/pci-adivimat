import type { NextFunction, Request, Response } from 'express';

import type { ApiError } from '@adivimat/shared';

import { hayAdministradores } from '../models/user';
import { verifyToken } from '../utils/generateToken';

/** Extrae el token de una cabecera `Authorization: Bearer <token>`. */
function extraerToken(cabecera: string | undefined): string | null {
  if (!cabecera) return null;

  const [esquema, token] = cabecera.split(' ');
  if (esquema !== 'Bearer' || !token) return null;

  return token;
}

/**
 * Exige un token valido y deja el payload en `req.user`.
 *
 * La version anterior hacia `req.headers.authorization.split(' ')[1]` sin
 * comprobar nada; sin cabecera lanzaba un TypeError que el catch convertia en
 * un 401 enganoso. Con `strict`, `authorization` es `string | undefined` y no
 * compila sin manejar el caso.
 */
export function requireAuth(req: Request, res: Response<ApiError>, next: NextFunction): void {
  const token = extraerToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ message: 'Token no proporcionado' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ message: 'Token invalido o expirado' });
    return;
  }

  req.user = payload;
  next();
}

/** Exige, ademas de un token valido, que el usuario sea administrador. */
export function requireAdmin(req: Request, res: Response<ApiError>, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (!req.user?.isAdmin) {
      res.status(403).json({ message: 'Acceso denegado' });
      return;
    }
    next();
  });
}

/**
 * Autoriza el alta de administradores segun el estado del sistema.
 *
 * Sin ningun administrador todavia, deja pasar: el controlador exigira el
 * ADMIN_CODE. En cuanto existe uno, el alta pasa a ser una operacion de
 * administrador y el codigo deja de valer.
 *
 * La comprobacion se hace por peticion, y no al arrancar, porque el estado
 * cambia justo con el primer alta.
 */
export async function autorizarRegistro(
  req: Request,
  res: Response<ApiError>,
  next: NextFunction,
): Promise<void> {
  try {
    if (await hayAdministradores()) {
      requireAdmin(req, res, next);
      return;
    }
    next();
  } catch {
    res.status(500).json({ message: 'Error al comprobar el estado del sistema' });
  }
}
