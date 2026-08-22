import {
  type HydratedArraySubdocument,
  type HydratedDocument,
  type Model,
  Schema,
  Types,
  model,
} from 'mongoose';

import { INTENTOS_POR_DEFECTO } from '@adivimat/shared';

/**
 * Temas, subtemas y adivinanzas viven en un mismo documento: subtemas y
 * adivinanzas son subdocumentos de Tema, no colecciones aparte.
 *
 * Los tres esquemas estan en un solo archivo porque el orden de definicion
 * importa (cada uno se incrusta en el siguiente), y porque antes esa
 * dependencia estaba oculta tras `require('./subtema').schema`, que exportaba
 * un modelo entero solo para leerle el `.schema`.
 *
 * Cada entidad tiene dos tipos:
 *
 * - `I*`   -> forma en crudo, sin `_id` ni metodos. Es lo que se guarda.
 * - `*Doc` -> documento hidratado, con `_id`, `save()` y `deleteOne()`.
 *
 * La distincion importa: `save()` solo existe en el hidratado, asi que llamarlo
 * sobre un objeto plano no compila.
 */

/* ---------------------------------------------------------- adivinanza -- */

export interface IAdivinanza {
  pregunta: string;
  respuesta: string;
  intentos: number;
  puntos: number;
  respuestaRevelada: boolean;
}

export type AdivinanzaDoc = HydratedArraySubdocument<IAdivinanza>;

export const AdivinanzaSchema = new Schema<IAdivinanza>({
  pregunta: { type: String, required: true, trim: true },
  respuesta: { type: String, required: true, trim: true },
  intentos: {
    type: Number,
    default: INTENTOS_POR_DEFECTO,
    min: [0, 'Los intentos no pueden ser negativos'],
  },
  puntos: {
    type: Number,
    default: 0,
    min: [0, 'Los puntos no pueden ser negativos'],
  },
  respuestaRevelada: { type: Boolean, default: false },
});

AdivinanzaSchema.index({ pregunta: 1 });

/* ------------------------------------------------------------- subtema -- */

export interface ISubtema {
  name: string;
  adivinanzas: IAdivinanza[];
}

/** Subtema hidratado: su array de adivinanzas expone `.id()`. */
export type SubtemaDoc = HydratedArraySubdocument<
  ISubtema,
  { adivinanzas: Types.DocumentArray<IAdivinanza, AdivinanzaDoc> }
>;

export const SubtemaSchema = new Schema<ISubtema>({
  name: { type: String, required: true, trim: true },
  adivinanzas: { type: [AdivinanzaSchema], default: [] },
});

/* ---------------------------------------------------------------- tema -- */

export interface ITema {
  tema: string;
  subtemas: ISubtema[];
}

export type TemaDoc = HydratedDocument<
  ITema,
  { subtemas: Types.DocumentArray<ISubtema, SubtemaDoc> }
>;

export const TemaSchema = new Schema<ITema>({
  tema: { type: String, required: true, trim: true },
  subtemas: { type: [SubtemaSchema], default: [] },
});

export type TemaModel = Model<ITema, {}, {}, {}, TemaDoc>;

export const Tema = model<ITema, TemaModel>('Tema', TemaSchema);
