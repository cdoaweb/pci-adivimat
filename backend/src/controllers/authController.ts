import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { MongoServerError } from 'mongodb';

import {
  type ApiError,
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  type RegisterResponse,
  esValido,
  validarLogin,
  validarRegistro,
} from '@adivimat/shared';

import { toUserPublic } from '../models/mappers';
import { User } from '../models/user';
import { config } from '../config/env';
import { generateToken } from '../utils/generateToken';

const SALT_ROUNDS = 10;

/** Codigo de error de MongoDB para violacion de indice unico. */
const DUPLICATE_KEY = 11000;

/**
 * Registra un administrador.
 *
 * Se conserva el comportamiento original: hace falta `adminCode` y el usuario
 * creado siempre es admin. No existe registro de usuarios normales.
 */
export async function register(
  req: Request<unknown, unknown, Partial<RegisterRequest>>,
  res: Response<RegisterResponse | ApiError>,
): Promise<void> {
  const errores = validarRegistro(req.body);
  if (!esValido(errores)) {
    res.status(400).json({ message: Object.values(errores).join('. ') });
    return;
  }

  /* Tras `esValido` los campos existen, pero el compilador no lo deduce del
     tipo `Partial`, asi que se desestructuran con valores ya comprobados. */
  const { username, email, password, adminCode } = req.body as RegisterRequest;

  if (adminCode !== config.adminCode) {
    res.status(401).json({ message: 'Codigo de administrador incorrecto' });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ username, email, password: hashedPassword, isAdmin: true });
    await user.save();

    const token = generateToken({ id: user._id.toString(), isAdmin: user.isAdmin });

    /* Se devuelve `user` ademas de `token`: el frontend ya lo esperaba y
       recibia `undefined`. */
    res.status(201).json({
      message: 'Administrador creado correctamente',
      token,
      user: toUserPublic(user),
    });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === DUPLICATE_KEY) {
      res.status(409).json({ message: 'Ya existe un usuario con ese email o nombre de usuario' });
      return;
    }
    res.status(500).json({ message: 'Error al registrar el administrador' });
  }
}

export async function login(
  req: Request<unknown, unknown, Partial<LoginRequest>>,
  res: Response<LoginResponse | ApiError>,
): Promise<void> {
  const errores = validarLogin(req.body);
  if (!esValido(errores)) {
    res.status(400).json({ message: Object.values(errores).join('. ') });
    return;
  }

  const { email, password } = req.body as LoginRequest;

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    /* Mismo mensaje y mismo codigo tanto si el usuario no existe como si la
       contrasena falla, para no revelar que emails estan registrados. */
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Credenciales invalidas' });
      return;
    }

    const token = generateToken({ id: user._id.toString(), isAdmin: user.isAdmin });

    res.json({ token, user: toUserPublic(user) });
  } catch {
    res.status(500).json({ message: 'Error al iniciar sesion' });
  }
}
