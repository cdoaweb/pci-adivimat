import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { Subtema, Tema } from '@adivimat/shared';

import { api, mensajeDeError } from '../lib/api';

/**
 * Estado compartido de temas y subtemas.
 *
 * Nota: hoy ningun componente lo usa (la gestion la lleva ThemeManager con su
 * propio estado). Se conserva porque la ruta de importacion que tenia,
 * `../utils/axiosConfig`, no existia: el archivo esta en `Components/utils/`,
 * de modo que este modulo habria roto la compilacion en cuanto alguien lo
 * importase.
 */
interface ThemeContextValue {
  themes: Tema[];
  selectedTheme: Tema | null;
  selectedSubtheme: Subtema | null;
  error: string | null;
  setSelectedTheme: (tema: Tema | null) => void;
  setSelectedSubtheme: (subtema: Subtema | null) => void;
  fetchThemes: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themes, setThemes] = useState<Tema[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Tema | null>(null);
  const [selectedSubtheme, setSelectedSubtheme] = useState<Subtema | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchThemes = useCallback(async () => {
    try {
      const { data } = await api.get<Tema[]>('/api/temas');
      setThemes(data);
      setError(null);
    } catch (err) {
      /* Antes esto era un `alert()`, que bloquea el hilo y es inaccesible para
         lectores de pantalla. Ahora es estado que la vista puede mostrar. */
      setError(mensajeDeError(err, 'Error al cargar los temas'));
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themes,
      selectedTheme,
      selectedSubtheme,
      error,
      setSelectedTheme,
      setSelectedSubtheme,
      fetchThemes,
    }),
    [themes, selectedTheme, selectedSubtheme, error, fetchThemes],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemes(): ThemeContextValue {
  const contexto = useContext(ThemeContext);
  if (!contexto) {
    throw new Error('useThemes debe usarse dentro de un ThemeProvider');
  }
  return contexto;
}
