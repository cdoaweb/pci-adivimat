import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthProvider';

/**
 * Protege las rutas de administracion.
 *
 * Espera a que termine la restauracion de sesion antes de decidir: sin esa
 * espera, al recargar una pagina protegida el estado todavia estaba vacio y
 * redirigia a /login aunque hubiese sesion valida.
 */
function PrivateRoute({ children }: { children: ReactNode }) {
  const { state, loading } = useAuth();

  if (loading) {
    return <p>Cargando...</p>;
  }

  /* `user?.isAdmin` en vez de `user.isAdmin`: con el bug del token, el estado
     podia quedar autenticado y con user a null, y esto reventaba. */
  return state.isAuthenticated && state.user?.isAdmin ? <>{children}</> : <Navigate to="/login" replace />;
}

export default PrivateRoute;
