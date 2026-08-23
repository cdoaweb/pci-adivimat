import { Router } from 'express';

import { estadoBootstrap, login, register } from '../controllers/authController';
import { autorizarRegistro, requireAuth } from '../middleware/auth';

const router = Router();

/* Publico: el formulario de alta lo consulta para saber si debe pedir el
   codigo inicial o exigir sesion de administrador. */
router.get('/bootstrap', estadoBootstrap);

/* El alta solo es publica mientras no exista ningun administrador. */
router.post('/register', autorizarRegistro, register);
router.post('/login', login);

/**
 * Comprueba que el token siga siendo valido.
 *
 * Sustituye a `router.use('/admin', isAdmin)`, que registraba el middleware
 * bajo una ruta que no existia y por tanto no se ejecutaba nunca.
 */
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.get('/logout', (_req, res) => {
  res.status(200).json({ message: 'Sesion cerrada. Elimina el token del cliente.' });
});

export default router;
