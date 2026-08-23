import type { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';

import {
  type Adivinanza,
  type ApiError,
  type ResponderRequest,
  type ResponderResponse,
  type SiguienteAdivinanzaResponse,
  type Subtema,
  registrarIntento,
} from '@adivimat/shared';

import { type SubtemaDoc, type TemaDoc, Tema } from '../models/tema';
import { toAdivinanza, toSubtema } from '../models/mappers';

/**
 * Endpoints de la partida.
 *
 * Antes vivian como handlers anonimos dentro de `temasRoutes.js`, mezclados con
 * la definicion de rutas y sin un solo try/catch: cualquier fallo se convertia
 * en una promesa sin capturar y Node mataba el proceso. Aqui la ruta solo
 * enruta, y la logica de juego real vive en `@adivimat/shared` para que la app
 * movil pueda reutilizarla sin conexion.
 */

/** Registra el fallo y responde 500, sin filtrar la traza al cliente. */
function responderError(res: Response<ApiError>, error: unknown): void {
  console.error('Error en el controlador de partida:', error);
  res.status(500).json({ message: 'Error interno del servidor' });
}

/**
 * Localiza el tema que contiene un subtema, junto con el subtema en si.
 *
 * Carga el documento entero a proposito. La version anterior usaba la
 * proyeccion posicional `{ 'subtemas.$': 1 }`, y Mongoose se niega a hacer
 * `save()` sobre un array cargado asi porque no puede calcular un delta seguro:
 * lanzaba DivergentArrayError, que al no estar capturado tumbaba el proceso
 * entero cada vez que alguien respondia una adivinanza.
 */
async function buscarPorSubtema(
  subtemaId: string,
): Promise<{ tema: TemaDoc; subtema: SubtemaDoc } | null> {
  if (!isValidObjectId(subtemaId)) return null;

  const tema = await Tema.findOne({ 'subtemas._id': subtemaId });
  if (!tema) return null;

  const subtema = tema.subtemas.id(subtemaId);
  if (!subtema) return null;

  return { tema, subtema };
}

/**
 * Devuelve un subtema por su id.
 *
 * La version anterior hacia `Tema.findById(subtemaId)`, es decir, buscaba un
 * tema usando el id de un subtema: siempre devolvia 404.
 */
export async function getSubtemaPorId(
  req: Request<{ subtemaId: string }>,
  res: Response<Subtema | ApiError>,
): Promise<void> {
  try {
    const encontrado = await buscarPorSubtema(req.params.subtemaId);
    if (!encontrado) {
      res.status(404).json({ message: 'Subtema no encontrado' });
      return;
    }

    res.json(toSubtema(encontrado.subtema));
  } catch (error) {
    responderError(res, error);
  }
}

/** Devuelve la adivinanza siguiente a la indicada dentro del mismo subtema. */
export async function getSiguienteAdivinanza(
  req: Request<{ subtemaId: string; adivinanzaId: string }>,
  res: Response<SiguienteAdivinanzaResponse | ApiError>,
): Promise<void> {
  try {
    const encontrado = await buscarPorSubtema(req.params.subtemaId);
    if (!encontrado) {
      res.status(404).json({ message: 'Subtema no encontrado' });
      return;
    }

    const { adivinanzas } = encontrado.subtema;
    const indice = adivinanzas.findIndex((a) => a._id.equals(req.params.adivinanzaId));

    if (indice === -1) {
      res.status(404).json({ message: 'Adivinanza no encontrada' });
      return;
    }

    const siguiente = adivinanzas[indice + 1];

    /* Antes se devolvia o bien una adivinanza o bien `{ message }`, dos formas
       distintas en el mismo endpoint que el cliente tenia que distinguir a
       mano. Ahora la forma es siempre la misma y `adivinanza` es null al final. */
    if (!siguiente) {
      res.json({ adivinanza: null, message: 'No hay mas adivinanzas en este subtema' });
      return;
    }

    res.json({ adivinanza: toAdivinanza(siguiente) });
  } catch (error) {
    responderError(res, error);
  }
}

/** Devuelve las adivinanzas de un subtema concreto de un tema. */
export async function cambiarSubtema(
  req: Request<{ temaId: string; subtemaId: string }>,
  res: Response<Adivinanza[] | ApiError>,
): Promise<void> {
  try {
    const { temaId, subtemaId } = req.params;

    if (!isValidObjectId(temaId) || !isValidObjectId(subtemaId)) {
      res.status(400).json({ message: 'Identificador invalido' });
      return;
    }

    const tema = await Tema.findById(temaId);
    if (!tema) {
      res.status(404).json({ message: 'Tema no encontrado' });
      return;
    }

    const subtema = tema.subtemas.id(subtemaId);
    if (!subtema) {
      res.status(404).json({ message: 'Subtema no encontrado' });
      return;
    }

    res.json(subtema.adivinanzas.map(toAdivinanza));
  } catch (error) {
    responderError(res, error);
  }
}

/**
 * Evalua un intento de respuesta.
 *
 * No guarda nada. Antes descontaba los intentos sobre la propia adivinanza y
 * hacia `save()`, pero esa adivinanza es contenido compartido: los fallos de un
 * jugador consumian los intentos de todos los demas y, al agotarse, marcaban la
 * respuesta como revelada para siempre en el temario.
 *
 * El progreso de cada jugador vive ahora en su dispositivo, porque la
 * aplicacion se juega sin cuenta y no hay a quien asociarlo en el servidor.
 * Este endpoint queda como forma de resolver un intento sin llevar la logica en
 * el cliente; la web usa `registrarIntento` de @adivimat/shared directamente.
 *
 * `intentosRestantes` lo aporta quien juega. Si no viene, se parte del cupo que
 * concede la adivinanza.
 */
export async function responder(
  req: Request<{ subtemaId: string; adivinanzaId: string }, unknown, Partial<ResponderRequest>>,
  res: Response<ResponderResponse | ApiError>,
): Promise<void> {
  try {
    const { respuestaUsuario, intentosRestantes } = req.body;

    if (typeof respuestaUsuario !== 'string') {
      res.status(400).json({ message: 'Falta el campo respuestaUsuario' });
      return;
    }

    if (
      intentosRestantes !== undefined &&
      (!Number.isInteger(intentosRestantes) || intentosRestantes < 0)
    ) {
      res.status(400).json({ message: 'intentosRestantes debe ser un entero no negativo' });
      return;
    }

    const encontrado = await buscarPorSubtema(req.params.subtemaId);
    if (!encontrado) {
      res.status(404).json({ message: 'Subtema no encontrado' });
      return;
    }

    const adivinanza = encontrado.subtema.adivinanzas.id(req.params.adivinanzaId);
    if (!adivinanza) {
      res.status(404).json({ message: 'Adivinanza no encontrada' });
      return;
    }

    const { resultado } = registrarIntento(
      {
        respuesta: adivinanza.respuesta,
        respuestasAceptadas: adivinanza.respuestasAceptadas,
        intentos: intentosRestantes ?? adivinanza.intentos,
        puntos: 0,
        respuestaRevelada: false,
      },
      respuestaUsuario,
    );

    res.json(resultado);
  } catch (error) {
    responderError(res, error);
  }
}
