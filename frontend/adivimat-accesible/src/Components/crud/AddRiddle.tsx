import { type FormEvent, useState } from 'react';

import type { CreateAdivinanzaRequest } from '@adivimat/shared';

import { api, mensajeDeError } from '../../lib/api';

interface AddRiddleProps {
  temaId: string;
  subtemaId: string;
  onClose: () => void;
}

function AddRiddle({ temaId, subtemaId, onClose }: AddRiddleProps) {
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      const cuerpo: CreateAdivinanzaRequest = { pregunta, respuesta };
      await api.post(`/api/temas/${temaId}/subtemas/${subtemaId}/adivinanzas`, cuerpo);
      onClose();
    } catch (err) {
      setError(mensajeDeError(err, 'Error al anadir la adivinanza'));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Nueva adivinanza</h3>
      {error && <p role="alert">{error}</p>}
      <label>
        Pregunta:
        <input type="text" value={pregunta} onChange={(e) => setPregunta(e.target.value)} required />
      </label>
      <label>
        Respuesta:
        <input
          type="text"
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          required
        />
      </label>
      <button type="submit">Anadir Adivinanza</button>
      <button type="button" onClick={onClose}>
        Cancelar
      </button>
    </form>
  );
}

export default AddRiddle;
