import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';

import type { ApiError } from '@adivimat/shared';

import { config } from './config/env';
import authRoutes from './routes/authRoutes';
import temasRoutes from './routes/temasRoutes';

/**
 * Construye la app de Express sin arrancarla.
 *
 * Separar esto de `server.ts` permite montar la app en un test sin abrir un
 * puerto ni conectar a Mongo.
 */
export function createApp() {
  const app = express();

  /* Antes era `cors()` a secas, que acepta cualquier origen. Ahora la lista
     viene de CORS_ORIGINS. */
  app.use(cors({ origin: config.corsOrigins, credentials: true }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api', temasRoutes);

  app.use((_req, res: Response<ApiError>) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
  });

  /* Red de seguridad: cualquier excepcion que se escape de un handler acaba
     aqui como un 500 limpio, sin filtrar la traza al cliente. */
  app.use((error: unknown, _req: Request, res: Response<ApiError>, _next: NextFunction) => {
    console.error('Error no controlado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  });

  return app;
}
