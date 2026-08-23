import { StyleSheet } from 'react-native';

/**
 * Paleta y estilos comunes.
 *
 * Los contrastes estan elegidos por encima de 4.5:1 sobre el fondo, el minimo
 * que pide WCAG AA para texto normal. La aplicacion se llama Accesible, asi que
 * no es un detalle opcional.
 */
export const colores = {
  fondo: '#11151c',
  tarjeta: '#1c2430',
  texto: '#f2f5f9',
  textoSuave: '#a8b3c2',
  acento: '#6fb3ff',
  acierto: '#7ddba1',
  error: '#ff9a9a',
} as const;

export const estilosComunes = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
    padding: 16,
  },
  centrado: {
    flex: 1,
    backgroundColor: colores.fondo,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  texto: { color: colores.texto, fontSize: 16, marginBottom: 12 },
  textoSuave: { color: colores.textoSuave, fontSize: 14 },
  error: { color: colores.error, fontSize: 16, textAlign: 'center' },
  boton: {
    backgroundColor: colores.acento,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    /* 44 puntos es el minimo recomendado para un objetivo tactil. */
    minHeight: 44,
    justifyContent: 'center',
  },
  botonSecundario: {
    backgroundColor: colores.tarjeta,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  textoBoton: { color: '#0b1017', fontSize: 16, fontWeight: '600' },
  textoBotonSecundario: { color: colores.texto, fontSize: 16, fontWeight: '600' },
});
