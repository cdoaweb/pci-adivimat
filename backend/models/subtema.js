const mongoose = require('mongoose');
const AdivinanzaSchema = require('./Adivinanza').schema;

const SubtemaSchema = new mongoose.Schema({
  name: String,
  adivinanzas: [AdivinanzaSchema]
});

module.exports = mongoose.model('Subtema', SubtemaSchema);