/**
 * Rutas de la aplicacion y lo que espera cada una.
 *
 * React Navigation usa este tipo para comprobar en compilacion que ninguna
 * pantalla se navega sin sus parametros, ni con parametros que no existen.
 */
export type RootStackParamList = {
  Temas: undefined;
  Subtemas: { temaId: string; temaNombre: string };
  Juego: { temaId: string; subtemaId: string; subtemaNombre: string };
};
