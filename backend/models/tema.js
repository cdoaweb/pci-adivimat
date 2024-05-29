const mongoose = require('mongoose');
const SubtemaSchema = require('./subtema').schema;

const TemaSchema = new mongoose.Schema({
  tema: String,
  subtemas: [SubtemaSchema]
});

module.exports = mongoose.model('Tema', TemaSchema);
