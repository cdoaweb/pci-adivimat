import type { Request, Response } from 'express';
import { Error as MongooseError, isValidObjectId } from 'mongoose';

import type {
  Adivinanza,
  ApiError,
  CreateAdivinanzaRequest,
  CreateSubtemaRequest,
  CreateTemaRequest,
  Subtema,
  Tema as TemaDTO,
  UpdateAdivinanzaRequest,
  UpdateSubtemaRequest,
  UpdateTemaRequest,
} from '@adivimat/shared';

import { type AdivinanzaDoc, type SubtemaDoc, type TemaDoc, Tema } from '../models/tema';
import { toAdivinanza, toSubtema, toTema } from '../models/mappers';

/**
 * CRUD de temas, subtemas y adivinanzas.
 *
 * Cada handler resuelve la cadena tema -> subtema -> adivinanza con los helpers
 * de abajo, que devuelven `null` cuando algo no existe. Antes cada handler
 * encadenaba `tema.subtemas.id(...)` directamente, y un id inexistente producia
 * un 500 con un TypeError en lugar de un 404.
 */

/** Traduce un error de Mongoose al codigo HTTP que le corresponde. */
function responderError(res: Response<ApiError>, error: unknown): void {
  if (error instanceof MongooseError.ValidationError) {
    res.status(400).json({ message: error.message });
    return;
  }
  if (error instanceof MongooseError.CastError) {
    res.status(400).json({ message: `Identificador invalido: ${String(error.value)}` });
    return;
  }
  res.status(500).json({ message: 'Error interno del servidor' });
}

/** Busca un tema, o responde 400/404 y devuelve `null`. */
async function buscarTema(temaId: string, res: Response<ApiError>): Promise<TemaDoc | null> {
  if (!isValidObjectId(temaId)) {
    res.status(400).json({ message: 'Identificador de tema invalido' });
    return null;
  }

  const tema = await Tema.findById(temaId);
  if (!tema) {
    res.status(404).json({ message: 'Tema no encontrado' });
    return null;
  }
  return tema;
}

/** Busca un subtema dentro de un tema, o responde 400/404 y devuelve `null`. */
function buscarSubtema(tema: TemaDoc, subtemaId: string, res: Response<ApiError>): SubtemaDoc | null {
  if (!isValidObjectId(subtemaId)) {
    res.status(400).json({ message: 'Identificador de subtema invalido' });
    return null;
  }

  const subtema = tema.subtemas.id(subtemaId);
  if (!subtema) {
    res.status(404).json({ message: 'Subtema no encontrado' });
    return null;
  }
  return subtema;
}

/** Busca una adivinanza dentro de un subtema, o responde 400/404 y devuelve `null`. */
function buscarAdivinanza(
  subtema: SubtemaDoc,
  adivinanzaId: string,
  res: Response<ApiError>,
): AdivinanzaDoc | null {
  if (!isValidObjectId(adivinanzaId)) {
    res.status(400).json({ message: 'Identificador de adivinanza invalido' });
    return null;
  }

  const adivinanza = subtema.adivinanzas.id(adivinanzaId);
  if (!adivinanza) {
    res.status(404).json({ message: 'Adivinanza no encontrada' });
    return null;
  }
  return adivinanza;
}

/* ---------------------------------------------------------------- temas -- */

export async function createTema(
  req: Request<Record<string, string>, unknown, CreateTemaRequest>,
  res: Response<TemaDTO | ApiError>,
): Promise<void> {
  try {
    const tema = await Tema.create({ tema: req.body.tema, subtemas: [] });
    res.status(201).json(toTema(tema));
  } catch (error) {
    responderError(res, error);
  }
}

export async function getTemas(_req: Request, res: Response<TemaDTO[] | ApiError>): Promise<void> {
  try {
    const temas = await Tema.find();
    res.json(temas.map(toTema));
  } catch (error) {
    responderError(res, error);
  }
}

export async function getTema(
  req: Request<{ temaId: string }>,
  res: Response<TemaDTO | ApiError>,
): Promise<void> {
  try {
    const tema = await buscarTema(req.params.temaId, res);
    if (!tema) return;

    res.json(toTema(tema));
  } catch (error) {
    responderError(res, error);
  }
}

export async function updateTema(
  req: Request<{ temaId: string }, unknown, UpdateTemaRequest>,
  res: Response<TemaDTO | ApiError>,
): Promise<void> {
  try {
    const tema = await buscarTema(req.params.temaId, res);
    if (!tema) return;

    if (req.body.tema !== undefined) {
      tema.tema = req.body.tema;
    }
    await tema.save();

    res.json(toTema(tema));
  } catch (error) {
    responderError(res, error);
  }
}

/* ------------------------------------------------------------- subtemas -- */

export async function createSubtema(
  req: Request<{ temaId: string }, unknown, CreateSubtemaRequest>,
  res: Response<TemaDTO | ApiError>,
): Promise<void> {
  try {
    const tema = await buscarTema(req.params.temaId, res);
    if (!tema) return;

    tema.subtemas.push({ name: req.body.name, adivinanzas: [] });
    await tema.save();

    res.status(201).json(toTema(tema));
  } catch (error) {
    responderError(res, error);
  }
}

export async function getSubtemas(
  req: Request<{ temaId: string }>,
  res: Response<Subtema[] | ApiError>,
): Promise<void> {
  try {
    const tema = await buscarTema(req.params.temaId, res);
    if (!tema) return;

    res.json(tema.subtemas.map(toSubtema));
  } catch (error) {
    responderError(res, error);
  }
}

export async function updateSubtema(
  req: Request<{ temaId: string; subtemaId: string }, unknown, UpdateSubtemaRequest>,
  res: Response<Subtema | ApiError>,
): Promise<void> {
  try {
    const tema = await buscarTema(req.params.temaId, res);
    if (!tema) return;

    const subtema = buscarSubtema(tema, req.params.subtemaId, res);
    if (!subtema) return;

    if (req.body.name !== undefined) {
      subtema.name = req.body.name;
    }
    await tema.save();

    res.json(toSubtema(subtema));
  } catch (error) {
    responderError(res, error);
  }
}

export async function deleteSubtema(
  req: Request<{ temaId: string; subtemaId: string }>,
  res: Response<ApiError>,
): Promise<void> {
  try {
    const tema = await buscarTema(req.params.temaId, res);
    if (!tema) return;

    const subtema = buscarSubtema(tema, req.params.subtemaId, res);
    if (!subtema) return;

    /* `subdoc.remove()` desaparecio en Mongoose 7; con ^8.3.4 este endpoint
       lanzaba "is not a function" y acababa devolviendo 400. */
    subtema.deleteOne();
    await tema.save();

    res.status(204).send();
  } catch (error) {
    responderError(res, error);
  }
}

/* ---------------------------------------------------------- adivinanzas -- */

export async function createAdivinanza(
  req: Request<{ temaId: string; subtemaId: string }, unknown, CreateAdivinanzaRequest>,
  res: Response<Subtema | ApiError>,
): Promise<void> {
  try {
    const tema = await buscarTema(req.params.temaId, res);
    if (!tema) return;

    const subtema = buscarSubtema(tema, req.params.subtemaId, res);
    if (!subtema) return;

    const { pregunta, respuesta, intentos } = req.body;
    subtema.adivinanzas.push({
      pregunta,
      respuesta,
      ...(intentos !== undefined ? { intentos } : {}),
    });
    await tema.save();

    res.status(201).json(toSubtema(subtema));
  } catch (error) {
    responderError(res, error);
  }
}

export async function getAdivinanzas(
  req: Request<{ temaId: string; subtemaId: string }>,
  res: Response<Adivinanza[] | ApiError>,
): Promise<void> {
  try {
    const tema = await buscarTema(req.params.temaId, res);
    if (!tema) return;

    /* Antes buscaba con `subtemas.find(s => s.name === subtemaId)`, comparando
       un nombre con un id: siempre daba undefined y luego un 500. */
    const subtema = buscarSubtema(tema, req.params.subtemaId, res);
    if (!subtema) return;

    res.json(subtema.adivinanzas.map(toAdivinanza));
  } catch (error) {
    responderError(res, error);
  }
}

export async function updateAdivinanza(
  req: Request<
    { temaId: string; subtemaId: string; adivinanzaId: string },
    unknown,
    UpdateAdivinanzaRequest
  >,
  res: Response<Adivinanza | ApiError>,
): Promise<void> {
  try {
    const tema = await buscarTema(req.params.temaId, res);
    if (!tema) return;

    const subtema = buscarSubtema(tema, req.params.subtemaId, res);
    if (!subtema) return;

    const adivinanza = buscarAdivinanza(subtema, req.params.adivinanzaId, res);
    if (!adivinanza) return;

    const { pregunta, respuesta, intentos } = req.body;
    if (pregunta !== undefined) adivinanza.pregunta = pregunta;
    if (respuesta !== undefined) adivinanza.respuesta = respuesta;
    if (intentos !== undefined) adivinanza.intentos = intentos;

    await tema.save();

    res.json(toAdivinanza(adivinanza));
  } catch (error) {
    responderError(res, error);
  }
}

export async function deleteAdivinanza(
  req: Request<{ temaId: string; subtemaId: string; adivinanzaId: string }>,
  res: Response<ApiError>,
): Promise<void> {
  try {
    const tema = await buscarTema(req.params.temaId, res);
    if (!tema) return;

    const subtema = buscarSubtema(tema, req.params.subtemaId, res);
    if (!subtema) return;

    const adivinanza = buscarAdivinanza(subtema, req.params.adivinanzaId, res);
    if (!adivinanza) return;

    adivinanza.deleteOne();
    await tema.save();

    res.status(204).send();
  } catch (error) {
    responderError(res, error);
  }
}

/**
 * Carga masiva de temas. Se usa para sembrar la base de datos.
 *
 * Nota: igual que en la version original, no exige autenticacion.
 */
export async function cargarTemas(
  req: Request<Record<string, string>, unknown, CreateTemaRequest[]>,
  res: Response<TemaDTO[] | ApiError>,
): Promise<void> {
  if (!Array.isArray(req.body)) {
    res.status(400).json({ message: 'Se esperaba un array de temas' });
    return;
  }

  try {
    const temas = await Tema.insertMany(req.body);
    res.status(201).json(temas.map(toTema));
  } catch (error) {
    responderError(res, error);
  }
}
