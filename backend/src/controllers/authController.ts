import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { MongoServerError } from 'mongodb';

import {
  type ApiError,
  type BootstrapStatusResponse,
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  type RegisterResponse,
  esValido,
  validarLogin,
  validarRegistro,
} from '@adivimat/shared';

import { toUserPublic } from '../models/mappers';
import { User, hayAdministradores } from '../models/user';
import { config } from '../config/env';
import { generateToken } from '../utils/generateToken';

const SALT_ROUNDS = 10;

/** Codigo de error de MongoDB para violacion de indice unico. */
const DUPLICATE_KEY = 11000;

/** Estado del alta inicial. Publico: el formulario lo consulta antes de pintarse. */
export async function estadoBootstrap(
  _req: Request,
  res: Response<BootstrapStatusResponse | ApiError>,
): Promise<void> {
  try {
    res.json({ bootstrap: !(await hayAdministradores()) });
  } catch {
    res.status(500).json({ message: 'Error al comprobar el estado del sistema' });
  }
}

/**
 * Da de alta un administrador.
 *
 * Dos caminos, segun si el sistema ya tiene administradores:
 *
 * - Alta inicial (ninguno todavia): se autoriza con ADMIN_CODE y se devuelve
 *   un token, para poder entrar sin un segundo paso.
 * - Alta normal: la hace un administrador autenticado (lo comprueba
 *   `autorizarRegistro` antes de llegar aqui) y NO se devuelve token, para no
 *   sustituir su sesion por la de la cuenta recien creada.
 *
 * Antes bastaba con acertar un ADMIN_CODE compartido, que ademas valia
 * indefinidamente y para cualquiera que lo conociese.
 */
export async function register(
  req: Request<Record<string, string>, unknown, Partial<RegisterRequest>>,
  res: Response<RegisterResponse | ApiError>,
): Promise<void> {
  let esAltaInicial: boolean;
  try {
    esAltaInicial = !(await hayAdministradores());
  } catch {
    res.status(500).json({ message: 'Error al comprobar el estado del sistema' });
    return;
  }

  const errores = validarRegistro(req.body, esAltaInicial);
  if (!esValido(errores)) {
    res.status(400).json({ message: Object.values(errores).join('. ') });
    return;
  }

  const { username, email, password, adminCode } = req.body as RegisterRequest;

  if (esAltaInicial && adminCode !== config.adminCode) {
    res.status(401).json({ message: 'Codigo de administrador incorrecto' });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ username, email, password: hashedPassword, isAdmin: true });
    await user.save();

    const cuerpo: RegisterResponse = {
      message: esAltaInicial
        ? 'Administrador inicial creado correctamente'
        : 'Administrador creado correctamente',
      user: toUserPublic(user),
      ...(esAltaInicial
        ? { token: generateToken({ id: user._id.toString(), isAdmin: user.isAdmin }) }
        : {}),
    };

    res.status(201).json(cuerpo);
  } catch (error) {
    if (error instanceof MongoServerError && error.code === DUPLICATE_KEY) {
      res.status(409).json({ message: 'Ya existe un usuario con ese email o nombre de usuario' });
      return;
    }
    res.status(500).json({ message: 'Error al registrar el administrador' });
  }
}

export async function login(
  req: Request<Record<string, string>, unknown, Partial<LoginRequest>>,
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
