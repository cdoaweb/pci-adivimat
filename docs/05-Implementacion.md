# Implementación

## Back-end:
### Conexión a la Base de Datos

```javascript
// app.js
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conexión exitosa a MongoDB'))
.catch(err => console.error('Error al conectar con MongoDB:', err));
```

### Registro de Usuario admin para gestionar adivinanzas

```javascript
// authController.js
const bcrypt = require('bcrypt');
const User = require('../models/user');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
  try {
    const { username, email, password, adminCode } = req.body;

    // Verificar si el código de admin es correcto para permitir la creación de un admin
    if (adminCode !== process.env.ADMIN_CODE) {
      return res.status(401).json({ message: 'Unauthorized to create an admin' });
    }

    // Encriptar la contraseña antes de guardar el usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, isAdmin: true });
    await user.save();

    // Generar el token
    const token = generateToken(user._id, user.isAdmin);

    res.status(201).json({ message: 'Admin created successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Error registering new admin: ' + error.message });
  }
};
```

### Generación de Token JWT

```javascript
// generateToken.js
const jwt = require('jsonwebtoken');

// Generar un JWT
const generateToken = (userId, isAdmin) => {
  // Carga la clave secreta desde las variables de entorno
  const secretKey = process.env.JWT_SECRET;

  // Información del token
  const payload = {
    id: userId,
    isAdmin: isAdmin,
  };

  // Opciones del token
  const options = {
    expiresIn: '1h', // El token expira en 1 hora
  };

  // Crear el token
  const token = jwt.sign(payload, secretKey, options);
  return token;
};

module.exports = generateToken;
```

### Modelo de Tema con Subtemas y Adivinanzas
```javascript
// tema.js
const mongoose = require('mongoose');
const SubtemaSchema = require('./subtema').schema;

const TemaSchema = new mongoose.Schema({
  tema: String,
  subtemas: [SubtemaSchema]
});

module.exports = mongoose.model('Tema', TemaSchema);

// subtema.js
const mongoose = require('mongoose');
const AdivinanzaSchema = require('./adivinanza').schema;

const SubtemaSchema = new mongoose.Schema({
  name: String,
  adivinanzas: [AdivinanzaSchema]
});

module.exports = mongoose.model('Subtema', SubtemaSchema);

// adivinanza.js
const mongoose = require('mongoose');

const AdivinanzaSchema = new mongoose.Schema({
  pregunta: {
    type: String,
    trim: false
  },
  respuesta: {
    type: String,
    trim: false
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
```

### .env
ADMIN_CODE= (El proporcionado)
JWT_SECRET=(El proporcionado)
MONGO_URI=mongodb://usuario:contraseña@localhost:27017/adivimat?authSource=admin
BACKEND_PORT=8000




\pagebreak