import { useState } from 'react';

import type { Adivinanza } from '@adivimat/shared';

import { api, mensajeDeError } from '../../lib/api';

interface EliminarAdivinanzaProps {
  temaId: string;
  subtemaId: string;
  adivinanza: Adivinanza;
  onClose: () => void;
}

function EliminarAdivinanza({ temaId, subtemaId, adivinanza, onClose }: EliminarAdivinanzaProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      await api.delete(`/api/temas/${temaId}/subtemas/${subtemaId}/adivinanzas/${adivinanza.id}`);
      onClose();
    } catch (err) {
      setError(mensajeDeError(err, 'Error al eliminar la adivinanza'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Eliminar Adivinanza</h3>
      <p>Estas seguro de que deseas eliminar &quot;{adivinanza.pregunta}&quot;?</p>
      {error && <p role="alert">{error}</p>}
      <button onClick={() => void handleDelete()} disabled={loading}>
        {loading ? 'Eliminando...' : 'Eliminar Adivinanza'}
      </button>
      <button onClick={onClose}>Cancelar</button>
    </div>
  );
}

export default EliminarAdivinanza;
