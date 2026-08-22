import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { CreateTemaRequest } from '@adivimat/shared';

import { api, mensajeDeError } from '../../lib/api';

/**
 * `onClose` es opcional: la ruta /temas/nuevo monta este componente sin props,
 * y antes llamarlo desde ahi lanzaba "onClose is not a function". Sin prop, al
 * terminar se vuelve a la gestion.
 */
interface AddThemeProps {
  onClose?: () => void;
}

function AddTheme({ onClose }: AddThemeProps) {
  const [themeName, setThemeName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const terminar = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/gestion');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      const cuerpo: CreateTemaRequest = { tema: themeName };
      await api.post('/api/temas', cuerpo);
      terminar();
    } catch (err) {
      setError(mensajeDeError(err, 'Error al anadir el tema'));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nuevo tema</h2>
      {error && <p role="alert">{error}</p>}
      <label>
        Nombre del Tema:
        <input
          type="text"
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
          required
        />
      </label>
      <button type="submit">Anadir Tema</button>
      <button type="button" onClick={terminar}>
        Cancelar
      </button>
    </form>
  );
}

export default AddTheme;
