import Constants from 'expo-constants';

import type { ApiError } from '@adivimat/shared';

/**
 * Cliente HTTP de la app movil.
 *
 * Determinar la URL del backend es el detalle que mas se atraganta aqui: en un
 * movil, `localhost` es el propio telefono, no el ordenador donde corre el
 * backend. Apuntar a `http://localhost:4000` funciona en el navegador y falla
 * en cuanto se abre en un dispositivo real.
 *
 * Orden de preferencia:
 *
 * 1. `EXPO_PUBLIC_API_URL`, para apuntar a un backend desplegado.
 * 2. La IP de la maquina que sirve el bundle de desarrollo, que Expo expone en
 *    `hostUri`. Es la misma red que el telefono, asi que funciona sin
 *    configurar nada.
 * 3. `localhost`, ultimo recurso, valido solo en el emulador de iOS y en web.
 */
function resolverBaseUrl(): string {
  const configurada = process.env.EXPO_PUBLIC_API_URL;
  if (configurada) return configurada.replace(/\/+$/, '');

  /* hostUri viene como "192.168.1.40:8081": interesa solo el host. */
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];
  if (host) return `http://${host}:4000`;

  return 'http://localhost:4000';
}

export const BASE_URL = resolverBaseUrl();

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/**
 * Pide un recurso a la API.
 *
 * Se usa `fetch` en lugar de axios: React Native lo trae de serie y evita una
 * dependencia mas en el bundle.
 */
export async function apiGet<T>(ruta: string, senal?: AbortSignal): Promise<T> {
  const respuesta = await fetch(`${BASE_URL}${ruta}`, {
    headers: { Accept: 'application/json' },
    ...(senal ? { signal: senal } : {}),
  });

  if (!respuesta.ok) {
    /* El cuerpo de error de la API es `{ message }`, pero puede no serlo si
       falla algo antes de llegar a la aplicacion (un proxy, por ejemplo). */
    let mensaje = `Error ${respuesta.status}`;
    try {
      const cuerpo = (await respuesta.json()) as Partial<ApiError>;
      if (cuerpo?.message) mensaje = cuerpo.message;
    } catch {
      /* Respuesta sin JSON: se conserva el mensaje generico. */
    }
    throw new ApiRequestError(mensaje, respuesta.status);
  }

  return (await respuesta.json()) as T;
}

/** Convierte cualquier fallo en un texto presentable. */
export function mensajeDeError(error: unknown, porDefecto: string): string {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof TypeError) {
    /* fetch lanza TypeError cuando no llega a conectar. En un movil casi
       siempre significa que el backend no es visible desde esta red. */
    return `No se pudo conectar con el servidor (${BASE_URL}). Comprueba que el backend esta levantado y que el telefono esta en la misma red.`;
  }
  return porDefecto;
}
