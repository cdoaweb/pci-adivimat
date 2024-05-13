const mongoose = require('mongoose');

const AdivinanzaSchema = new mongoose.Schema({
  pregunta: {
    type: String,
    required: [true, 'La pregunta es obligatoria'],
    trim: true
  },
  respuesta: {
    type: String,
    required: [true, 'La respuesta es obligatoria'],
    trim: true
  },
  intentos: {
    type: Number,
    default: 5,
    min: [0, 'Los intentos no pueden ser negativos']
  },
  puntos: {
    type: Number,
    default: 0,
    min: [0, 'Los puntos no pueden ser negativos']
  },
  respuestaRevelada: {
    type: Boolean,
    default: false
  }
});

AdivinanzaSchema.index({ pregunta: 1 });

AdivinanzaSchema.methods.verificarRespuesta = function (respuestaUsuario) {
  return this.respuesta.toLowerCase() === respuestaUsuario.toLowerCase();
};

module.exports = mongoose.model('Adivinanza', AdivinanzaSchema);