import dotenv from 'dotenv';

dotenv.config();

/**
 * Lee y valida la configuracion al arrancar.
 *
 * Antes `mongoose.connect(process.env.MONGO_URI)` recibia `undefined` cuando
 * faltaba el .env y el fallo aparecia mucho despues, como un error de conexion
 * confuso. Aqui el proceso muere de inmediato diciendo que variable falta.
 */
function requerido(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. Copia .env.example a .env y rellenala.`,
    );
  }
  return valor;
}

function numero(nombre: string, porDefecto: number): number {
  const bruto = process.env[nombre];
  if (!bruto) return porDefecto;

  const valor = Number(bruto);
  if (!Number.isInteger(valor) || valor <= 0) {
    throw new Error(`La variable ${nombre} debe ser un entero positivo, se recibio "${bruto}".`);
  }
  return valor;
}

export interface Config {
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  adminCode: string;
  corsOrigins: string[];
  isProduction: boolean;
}

export const config: Config = {
  /* 4000 y no 3000: el 3000 lo ocupa el servidor de desarrollo del frontend. */
  port: numero('PORT', 4000),
  mongoUri: requerido('MONGO_URI'),
  jwtSecret: requerido('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  adminCode: requerido('ADMIN_CODE'),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean),
  isProduction: process.env.NODE_ENV === 'production',
};
