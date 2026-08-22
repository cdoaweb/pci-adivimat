import type { TokenPayload } from '@adivimat/shared';

/**
 * Adjunta el usuario autenticado a `Request`.
 *
 * Es opcional a proposito: en una ruta sin middleware de auth, `req.user` es
 * `undefined`, y con `strict` el compilador exige comprobarlo antes de usarlo.
 */
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export {};
