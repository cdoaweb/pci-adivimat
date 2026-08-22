import { Router } from 'express';

import { login, register } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/register', register);
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
