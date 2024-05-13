const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const temasRoutes = require('./routes/temasRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Conexión a MongoDB
mongoose.connect('mongodb://localhost/adivimat', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch(err => console.error('Error al conectar con MongoDB', err));

app.use(cors());
app.use(express.json());

app.use('/', temasRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});