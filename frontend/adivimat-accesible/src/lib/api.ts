import axios from 'axios';

import type { ApiError } from '@adivimat/shared';

/**
 * Cliente HTTP de la aplicacion.
 *
 * La URL sale de VITE_API_URL. En Vite las variables de entorno se leen de
 * `import.meta.env` y solo se exponen las que llevan el prefijo VITE_; el
 * `process.env.REACT_APP_*` de CRA no existe aqui.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/',
});

export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Evento que se emite cuando el servidor rechaza el token guardado.
 *
 * El modulo no navega por su cuenta: avisa, y AuthProvider decide. Asi el
 * cliente HTTP no depende del router ni fuerza una recarga completa de la
 * pagina.
 */
export const EVENTO_SESION_CADUCADA = 'auth:sesion-caducada';

/** Rutas donde un 401 significa "credenciales incorrectas", no "token caducado". */
const RUTAS_DE_CREDENCIALES = ['/api/auth/login', '/api/auth/register'];

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? '';
      const esIntentoDeLogin = RUTAS_DE_CREDENCIALES.some((ruta) => url.includes(ruta));

      /* Solo se trata como caducidad si habia una sesion guardada: un 401 al
         iniciar sesion es una contrasena incorrecta y debe llegar al formulario
         tal cual. */
      if (!esIntentoDeLogin && localStorage.getItem(TOKEN_KEY)) {
        window.dispatchEvent(new Event(EVENTO_SESION_CADUCADA));
      }
    }
    return Promise.reject(error);
  },
);

/**
 * Extrae el mensaje de un fallo de la API.
 *
 * Antes se accedia a `error.response.data` directamente: cuando la peticion no
 * llegaba a salir (backend caido, sin red) `response` es undefined y el propio
 * catch lanzaba un TypeError. `isAxiosError` estrecha el tipo y obliga a
 * contemplar ese caso.
 */
export function mensajeDeError(error: unknown, porDefecto: string): string {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.message ?? porDefecto;
  }
  return porDefecto;
}

/** Lee un valor JSON de localStorage sin romperse si esta corrupto. */
export function leerJSON<T>(clave: string): T | null {
  const bruto = localStorage.getItem(clave);
  if (!bruto) return null;

  try {
    return JSON.parse(bruto) as T;
  } catch {
    /* Antes se guardaba la cadena "undefined" por el desajuste token/accessToken
       y `JSON.parse` reventaba al arrancar la aplicacion. */
    localStorage.removeItem(clave);
    return null;
  }
}
