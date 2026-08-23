import { Router } from 'express';

import {
  cargarTemas,
  createAdivinanza,
  createSubtema,
  createTema,
  deleteAdivinanza,
  deleteSubtema,
  getAdivinanzas,
  getSubtemas,
  getTema,
  getTemas,
  updateAdivinanza,
  updateSubtema,
  updateTema,
} from '../controllers/temaController';
import {
  cambiarSubtema,
  getSiguienteAdivinanza,
  getSubtemaPorId,
  responder,
} from '../controllers/juegoController';
import { requireAdmin } from '../middleware/auth';

/**
 * Rutas de contenido y de partida.
 *
 * Criterio de acceso:
 *
 * - Lectura y juego: publicos. La aplicacion existe para practicar sin
 *   registrarse, asi que listar temas y responder adivinanzas no pide sesion.
 * - Escritura: solo administradores. Antes no lo comprobaba nadie: el unico
 *   middleware de autorizacion se registraba con `router.use('/admin', ...)`
 *   en authRoutes, sobre una ruta que no existia, de modo que nunca llegaba a
 *   ejecutarse y cualquiera podia crear, editar o borrar contenido sin token.
 */
const router = Router();

/* Temas */
router.get('/temas', getTemas);
router.get('/temas/:temaId', getTema);
router.post('/temas', requireAdmin, createTema);
router.put('/temas/:temaId', requireAdmin, updateTema);

/* Subtemas */
router.get('/temas/:temaId/subtemas', getSubtemas);
router.post('/temas/:temaId/subtemas', requireAdmin, createSubtema);
router.put('/temas/:temaId/subtemas/:subtemaId', requireAdmin, updateSubtema);
router.delete('/temas/:temaId/subtemas/:subtemaId', requireAdmin, deleteSubtema);

/* Adivinanzas */
router.get('/temas/:temaId/subtemas/:subtemaId/adivinanzas', getAdivinanzas);
router.post('/temas/:temaId/subtemas/:subtemaId/adivinanzas', requireAdmin, createAdivinanza);
router.put(
  '/temas/:temaId/subtemas/:subtemaId/adivinanzas/:adivinanzaId',
  requireAdmin,
  updateAdivinanza,
);
router.delete(
  '/temas/:temaId/subtemas/:subtemaId/adivinanzas/:adivinanzaId',
  requireAdmin,
  deleteAdivinanza,
);

/* Carga masiva: inserta documentos sin limite, asi que es la que mas necesita
   la proteccion. */
router.post('/cargar-temas', requireAdmin, cargarTemas);

/* Partida: publica a proposito, para poder jugar sin cuenta. */
router.get('/subtemas/:subtemaId', getSubtemaPorId);
router.get('/siguiente-adivinanza/:subtemaId/:adivinanzaId', getSiguienteAdivinanza);
router.get('/cambiar-subtema/:temaId/:subtemaId', cambiarSubtema);
router.post('/respuesta/:subtemaId/:adivinanzaId', responder);

export default router;
