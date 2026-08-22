import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import App from '../App';
import { AuthProvider } from '../context/AuthProvider';

/**
 * Sustituye al test por defecto de CRA, que buscaba el texto "learn react" en
 * una aplicacion que nunca lo tuvo y por tanto fallaba siempre.
 */
function renderApp(ruta: string) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('App', () => {
  it('muestra la portada con el titulo de la aplicacion', async () => {
    renderApp('/');
    expect(await screen.findByRole('heading', { name: /bienvenido a adivimat/i })).toBeVisible();
  });

  it('ofrece el enlace de salto al contenido principal', () => {
    renderApp('/');
    expect(screen.getByRole('link', { name: /saltar al contenido principal/i })).toBeInTheDocument();
  });

  it('redirige a login cuando se entra en gestion sin sesion', async () => {
    renderApp('/gestion');
    expect(await screen.findByRole('heading', { name: /iniciar sesion/i })).toBeVisible();
  });
});
