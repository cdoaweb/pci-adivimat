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

const router = Router();

/* Temas */
router.post('/temas', createTema);
router.get('/temas', getTemas);
router.get('/temas/:temaId', getTema);
router.put('/temas/:temaId', updateTema);

/* Subtemas */
router.post('/temas/:temaId/subtemas', createSubtema);
router.get('/temas/:temaId/subtemas', getSubtemas);
router.put('/temas/:temaId/subtemas/:subtemaId', updateSubtema);
router.delete('/temas/:temaId/subtemas/:subtemaId', deleteSubtema);

/* Adivinanzas */
router.post('/temas/:temaId/subtemas/:subtemaId/adivinanzas', createAdivinanza);
router.get('/temas/:temaId/subtemas/:subtemaId/adivinanzas', getAdivinanzas);
router.put('/temas/:temaId/subtemas/:subtemaId/adivinanzas/:adivinanzaId', updateAdivinanza);
router.delete('/temas/:temaId/subtemas/:subtemaId/adivinanzas/:adivinanzaId', deleteAdivinanza);

/* Carga masiva */
router.post('/cargar-temas', cargarTemas);

/* Partida */
router.get('/subtemas/:subtemaId', getSubtemaPorId);
router.get('/siguiente-adivinanza/:subtemaId/:adivinanzaId', getSiguienteAdivinanza);
router.get('/cambiar-subtema/:temaId/:subtemaId', cambiarSubtema);
router.post('/respuesta/:subtemaId/:adivinanzaId', responder);

export default router;
