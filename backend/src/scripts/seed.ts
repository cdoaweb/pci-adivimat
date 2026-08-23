import { readFileSync } from 'node:fs';
import path from 'node:path';

import mongoose from 'mongoose';

import type { Dificultad } from '@adivimat/shared';

import { config } from '../config/env';
import { Tema } from '../models/tema';

/**
 * Carga las adivinanzas de ADIVIMAT en la base de datos.
 *
 *   npm run seed --workspace backend            # solo si esta vacia
 *   npm run seed --workspace backend -- --reset # borra y vuelve a cargar
 *
 * Funciona igual contra un Mongo local que contra Atlas: el destino es
 * siempre MONGO_URI.
 *
 * El JSON lo genera `seed/parse_adivimat.py` a partir del PDF del libro; no se
 * edita a mano.
 */

interface AdivinanzaSemilla {
  numero: number;
  pregunta: string;
  respuesta: string;
  respuestasAceptadas: string[];
  pista: string;
  dificultad: Dificultad;
  intentos: number;
}

interface SubtemaSemilla {
  name: string;
  adivinanzas: AdivinanzaSemilla[];
}

interface TemaSemilla {
  tema: string;
  subtemas: SubtemaSemilla[];
}

/* Sube dos niveles desde dist/scripts/ hasta la raiz del paquete backend. */
const RUTA_JSON = path.resolve(__dirname, '..', '..', 'seed', 'adivinanzas.json');

function leerSemilla(): TemaSemilla[] {
  const bruto = readFileSync(RUTA_JSON, 'utf-8');
  const datos = JSON.parse(bruto) as TemaSemilla[];

  if (!Array.isArray(datos) || datos.length === 0) {
    throw new Error(`${RUTA_JSON} no contiene ningun tema`);
  }
  return datos;
}

async function main(): Promise<void> {
  const reset = process.argv.includes('--reset');

  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 15000 });
  console.log('Conectado a MongoDB');

  const existentes = await Tema.countDocuments();

  if (existentes > 0 && !reset) {
    /* Sin --reset no se toca nada: cargar encima duplicaria todo el temario. */
    console.error(
      `La base de datos ya tiene ${existentes} tema(s). Usa --reset para borrarlos y volver a cargar.`,
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  if (reset && existentes > 0) {
    const { deletedCount } = await Tema.deleteMany({});
    console.log(`Borrados ${deletedCount} tema(s)`);
  }

  const semilla = leerSemilla();

  const documentos = semilla.map((tema) => ({
    tema: tema.tema,
    subtemas: tema.subtemas.map((subtema) => ({
      name: subtema.name,
      adivinanzas: subtema.adivinanzas.map((a) => ({
        numero: a.numero,
        pregunta: a.pregunta,
        respuesta: a.respuesta,
        respuestasAceptadas: a.respuestasAceptadas,
        /* Cadena vacia significa "sin matiz": no se guarda el campo. */
        ...(a.pista ? { pista: a.pista } : {}),
        dificultad: a.dificultad,
        intentos: a.intentos,
      })),
    })),
  }));

  const creados = await Tema.insertMany(documentos);

  const totalSubtemas = creados.reduce((n, t) => n + t.subtemas.length, 0);
  const totalAdivinanzas = creados.reduce(
    (n, t) => n + t.subtemas.reduce((m, s) => m + s.adivinanzas.length, 0),
    0,
  );

  console.log(
    `Cargados ${creados.length} temas, ${totalSubtemas} subtemas y ${totalAdivinanzas} adivinanzas`,
  );

  await mongoose.disconnect();
}

main().catch((error: unknown) => {
  console.error('No se pudo cargar la semilla:', error);
  process.exit(1);
});
