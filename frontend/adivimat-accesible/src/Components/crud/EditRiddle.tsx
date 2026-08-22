import { type FormEvent, useState } from 'react';

import type { Adivinanza, UpdateAdivinanzaRequest } from '@adivimat/shared';

import { api, mensajeDeError } from '../../lib/api';

interface EditRiddleProps {
  temaId: string;
  subtemaId: string;
  /* Se recibe la adivinanza ya cargada. Antes se volvia a pedir la lista
     entera al servidor solo para buscar dentro por id, con `useParams()` que
     aqui esta vacio. */
  adivinanza: Adivinanza;
  onClose: () => void;
}

function EditRiddle({ temaId, subtemaId, adivinanza, onClose }: EditRiddleProps) {
  const [pregunta, setPregunta] = useState(adivinanza.pregunta);
  const [respuesta, setRespuesta] = useState(adivinanza.respuesta);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const cuerpo: UpdateAdivinanzaRequest = { pregunta, respuesta };
      await api.put(
        `/api/temas/${temaId}/subtemas/${subtemaId}/adivinanzas/${adivinanza.id}`,
        cuerpo,
      );
      onClose();
    } catch (err) {
      setError(mensajeDeError(err, 'Error al actualizar la adivinanza'));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Editar Adivinanza</h3>
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
      <button type="submit">Guardar Cambios</button>
      <button type="button" onClick={onClose}>
        Cancelar
      </button>
    </form>
  );
}

export default EditRiddle;
