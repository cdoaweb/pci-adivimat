const Tema = require('../models/tema');

// CRUD para Temas sin Delete por de momento.
exports.createTema = async (req, res) => {
  try {
    const tema = new Tema(req.body);
    await tema.save();
    res.status(201).json(tema);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getTemas = async (req, res) => {
  try {
    const temas = await Tema.find();
    res.json(temas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTema = async (req, res) => {
  const { temaId } = req.params;
  try {
    const tema = await Tema.findByIdAndUpdate(temaId, req.body, { new: true });
    if (!tema) {
      return res.status(404).json({ message: 'Tema no encontrado' });
    }
    res.json(tema);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// CRUD para Subtemas.
exports.createSubtema = async (req, res) => {
  const { temaId } = req.params;
  const nuevoSubtema = req.body;
  try {
    const tema = await Tema.findById(temaId);
    tema.subtemas.push(nuevoSubtema);
    await tema.save();
    res.status(201).json(tema);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getSubtemas = async (req, res) => {
  const { temaId } = req.params;
  try {
    const tema = await Tema.findById(temaId);
    console.log(tema);
    res.json(tema.subtemas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSubtema = async (req, res) => {
  const { temaId, subtemaId } = req.params;
  try {
    const tema = await Tema.findById(temaId);
    const subtema = tema.subtemas.id(subtemaId);
    if (!subtema) {
      return res.status(404).json({ message: 'Subtema no encontrado' });
    }
    subtema.set(req.body);
    await tema.save();
    res.json(subtema);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSubtema = async (req, res) => {
  const { temaId, subtemaId } = req.params;
  try {
    const tema = await Tema.findById(temaId);
    tema.subtemas.id(subtemaId).remove();
    await tema.save();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// CRUD para Adivinanzas.
exports.createAdivinanza = async (req, res) => {
  const { temaId, subtemaId } = req.params;
  const nuevaAdivinanza = req.body;
  try {
    const tema = await Tema.findById(temaId);
    const subtema = tema.subtemas.id(subtemaId);
    subtema.adivinanzas.push(nuevaAdivinanza);
    await tema.save();
    res.status(201).json(subtema);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAdivinanzas = async (req, res) => {
  const { temaId, subtemaId } = req.params;
  try {
    const tema = await Tema.findById(temaId);
    const subtema = tema.subtemas.id(subtemaId);
    res.json(subtema.adivinanzas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAdivinanza = async (req, res) => {
  const { temaId, subtemaId, adivinanzaId } = req.params;
  try {
    const tema = await Tema.findById(temaId);
    const subtema = tema.subtemas.id(subtemaId);
    const adivinanza = subtema.adivinanzas.id(adivinanzaId);
    if (!adivinanza) {
      return res.status(404).json({ message: 'Adivinanza no encontrada' });
    }
    adivinanza.set(req.body);
    await tema.save();
    res.json(adivinanza);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAdivinanza = async (req, res) => {
  const { temaId, subtemaId, adivinanzaId } = req.params;
  try {
    const tema = await Tema.findById(temaId);
    const subtema = tema.subtemas.id(subtemaId);
    subtema.adivinanzas.id(adivinanzaId).remove();
    await tema.save();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};