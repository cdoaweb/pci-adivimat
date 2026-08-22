import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';

import type { LoginResponse, RegisterResponse, UserPublic } from '@adivimat/shared';

import { TOKEN_KEY, USER_KEY, api, leerJSON, mensajeDeError } from '../lib/api';

/**
 * Estado y acciones de autenticacion.
 *
 * `AuthAction` es una union discriminada: cada `type` fija exactamente que
 * lleva su `payload`. Es lo que hace imposible repetir el bug original, donde
 * el dispatch enviaba `{ user, accessToken }` y el reducer leia
 * `payload.token`, dejando `state.token` permanentemente en undefined.
 */
interface AuthState {
  isAuthenticated: boolean;
  user: UserPublic | null;
  token: string | null;
  loginError: string | null;
}

type AuthAction =
  | { type: 'AUTH_SUCCESS'; payload: { user: UserPublic; token: string } }
  | { type: 'AUTH_FAILED'; payload: string }
  | { type: 'LOGOUT' };

const estadoInicial: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loginError: null,
};

function authReducer(_state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return {
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loginError: null,
      };
    case 'AUTH_FAILED':
      return { ...estadoInicial, loginError: action.payload };
    case 'LOGOUT':
      return estadoInicial;
  }
}

interface AuthContextValue {
  state: AuthState;
  /** true mientras se restaura la sesion desde localStorage al arrancar. */
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
    adminCode: string,
  ) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, estadoInicial);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = leerJSON<UserPublic>(USER_KEY);

    /* Se exigen las dos cosas. Antes bastaba con que hubiese token, asi que la
       cadena "undefined" que dejaba el bug del login contaba como sesion
       valida y la aplicacion arrancaba autenticada sin usuario. */
    if (token && user) {
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
    }
    setLoading(false);
  }, []);

  const guardarSesion = useCallback((user: UserPublic, token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        /* El tipo del cuerpo viene de @adivimat/shared, el mismo que usa el
           backend al responder: si un dia cambia el nombre del campo, esto
           deja de compilar en vez de fallar en tiempo de ejecucion. */
        const { data } = await api.post<LoginResponse>('/api/auth/login', { email, password });
        guardarSesion(data.user, data.token);
      } catch (error) {
        dispatch({ type: 'AUTH_FAILED', payload: mensajeDeError(error, 'Error al iniciar sesion') });
      }
    },
    [guardarSesion],
  );

  const register = useCallback(
    async (email: string, password: string, username: string, adminCode: string) => {
      try {
        const { data } = await api.post<RegisterResponse>('/api/auth/register', {
          email,
          password,
          username,
          adminCode,
        });
        guardarSesion(data.user, data.token);
      } catch (error) {
        dispatch({ type: 'AUTH_FAILED', payload: mensajeDeError(error, 'Error en el registro') });
      }
    },
    [guardarSesion],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const getToken = useCallback(() => state.token, [state.token]);

  const value = useMemo<AuthContextValue>(
    () => ({ state, loading, login, register, logout, getToken }),
    [state, loading, login, register, logout, getToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Acceso al contexto de autenticacion.
 *
 * Lanza si se usa fuera del provider, en lugar de devolver undefined y dejar
 * que el fallo aparezca mas tarde como un "cannot read property of undefined".
 */
export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return contexto;
}
