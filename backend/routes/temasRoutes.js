const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Tema = require('../models/tema');
const temaController = require('../controllers/temaController');

router.use(express.json());

// Temas
router.post('/temas', temaController.createTema);
router.get('/temas', temaController.getTemas);
router.get('/temas/:temaId', temaController.getTema);
router.put('/temas/:temaId', temaController.updateTema);

// Subtemas
router.post('/temas/:temaId/subtemas', temaController.createSubtema);
router.get('/temas/:temaId/subtemas', temaController.getSubtemas);
router.put('/temas/:temaId/subtemas/:subtemaId', temaController.updateSubtema);
router.delete('/temas/:temaId/subtemas/:subtemaId', temaController.deleteSubtema);

// Adivinanzas
router.post('/temas/:temaId/subtemas/:subtemaId/adivinanzas', temaController.createAdivinanza);
router.get('/temas/:temaId/subtemas/:subtemaId/adivinanzas', temaController.getAdivinanzas);
router.put('/temas/:temaId/subtemas/:subtemaId/adivinanzas/:adivinanzaId', temaController.updateAdivinanza);
router.delete('/temas/:temaId/subtemas/:subtemaId/adivinanzas/:adivinanzaId', temaController.deleteAdivinanza);

//endpoint para cargar múltiples temas
router.post('/cargar-temas', async (req, res) => {
    try {
        const temas = await Tema.insertMany(req.body);
        res.status(201).json(temas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/subtemas/:subtemaId', async (req, res) => {
  const { subtemaId } = req.params;
  const subtema = await Tema.findById(subtemaId);
  console.log(subtema);
  if (subtema) {
    res.json(subtema);
  } else {
    res.status(404).send('Subtema no encontrado');
  }
});

router.get('/siguiente-adivinanza/:subtemaId/:adivinanzaId', async (req, res) => {
  const { subtemaId, adivinanzaId } = req.params;
  const tema = await Tema.findOne({ "subtemas._id": subtemaId }, { 'subtemas.$': 1 });
  if (tema) {
    const adivinanzas = tema.subtemas[0].adivinanzas;
    const currentIndex = adivinanzas.findIndex(a => a._id.equals(adivinanzaId));
    if (currentIndex !== -1 && currentIndex + 1 < adivinanzas.length) {
      res.json(adivinanzas[currentIndex + 1]);
    } else {
      res.json({ message: 'No hay más adivinanzas en este subtema' });
    }
  } else {
    res.status(404).send('Subtema no encontrado');
  }
});

router.get('/cambiar-subtema/:temaId/:subtemaId', async (req, res) => {
  const { temaId, subtemaId } = req.params;
  const tema = await Tema.findById(temaId);
  if (tema) {
    const subtema = tema.subtemas.find(st => st._id.equals(subtemaId));
    if (subtema) {
      res.json(subtema.adivinanzas);
    } else {
      res.status(404).send('Subtema no encontrado');
    }
  } else {
    res.status(404).send('Tema no encontrado');
  }
});

router.post('/respuesta/:subtemaId/:adivinanzaId', async (req, res) => {
  const { subtemaId, adivinanzaId } = req.params;
  const { respuestaUsuario } = req.body;
  const tema = await Tema.findOne({ "subtemas._id": subtemaId }, { 'subtemas.$': 1 });
  if (!tema) {
    return res.status(404).send('Subtema no encontrado');
  }

  const subtema = tema.subtemas[0];
  const adivinanza = subtema.adivinanzas.find(a => a._id.equals(adivinanzaId));

  if (!adivinanza) {
    return res.status(404).send('Adivinanza no encontrada');
  }

  if (adivinanza.intentos > 0) {
    adivinanza.intentos -= 1;
    if (adivinanza.respuesta === respuestaUsuario) {
      adivinanza.puntos += 10;
      await tema.save();
      res.json({ message: 'Respuesta correcta!', puntos: adivinanza.puntos, intentosRestantes: adivinanza.intentos });
    } else {
      if (adivinanza.intentos === 0) {
        adivinanza.respuestaRevelada = true;
        await tema.save();
        res.json({ message: 'No quedan más intentos. Respuesta correcta: ' + adivinanza.respuesta, respuestaRevelada: adivinanza.respuestaRevelada });
      } else {
        await tema.save();
        res.json({ message: 'Respuesta incorrecta', intentosRestantes: adivinanza.intentos });
      }
    }
  } else {
    res.json({ message: 'No quedan más intentos. Respuesta correcta: ' + adivinanza.respuesta, respuestaRevelada: true });
  }
});

module.exports = router;