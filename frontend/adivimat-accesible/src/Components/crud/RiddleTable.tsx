import { useCallback, useEffect, useState } from 'react';

import type { Adivinanza } from '@adivimat/shared';

import { api, mensajeDeError } from '../../lib/api';
import AddRiddle from './AddRiddle';
import EditRiddle from './EditRiddle';
import EliminarAdivinanza from './EliminarAdivinanza';

interface RiddleTableProps {
  temaId: string;
  subtemaId: string;
}

function RiddleTable({ temaId, subtemaId }: RiddleTableProps) {
  const [adivinanzas, setAdivinanzas] = useState<Adivinanza[]>([]);
  const [enEdicion, setEnEdicion] = useState<Adivinanza | null>(null);
  const [enBorrado, setEnBorrado] = useState<Adivinanza | null>(null);
  const [anadiendo, setAnadiendo] = useState(false);
  const [error, setError] = useState('');

  const fetchAdivinanzas = useCallback(async () => {
    try {
      const { data } = await api.get<Adivinanza[]>(
        `/api/temas/${temaId}/subtemas/${subtemaId}/adivinanzas`,
      );
      setAdivinanzas(data);
    } catch (err) {
      setError(mensajeDeError(err, 'Error al cargar las adivinanzas'));
    }
  }, [temaId, subtemaId]);

  useEffect(() => {
    void fetchAdivinanzas();
  }, [fetchAdivinanzas]);

  const cerrarYRefrescar = () => {
    setAnadiendo(false);
    setEnEdicion(null);
    setEnBorrado(null);
    void fetchAdivinanzas();
  };

  return (
    <section>
      <h2>Adivinanzas</h2>
      {error && <p role="alert">{error}</p>}

      <table>
        <thead>
          <tr>
            <th scope="col">Pregunta</th>
            <th scope="col">Respuesta</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {adivinanzas.map((adivinanza) => (
            <tr key={adivinanza.id}>
              <td>{adivinanza.pregunta}</td>
              <td>{adivinanza.respuesta}</td>
              <td>
                <button onClick={() => setEnEdicion(adivinanza)}>Editar</button>
                <button onClick={() => setEnBorrado(adivinanza)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={() => setAnadiendo(true)}>Anadir nueva adivinanza</button>

      {anadiendo && (
        <AddRiddle temaId={temaId} subtemaId={subtemaId} onClose={cerrarYRefrescar} />
      )}

      {/* Estos hijos reciben los ids por props. Antes los leian con
          `useParams()`, que aqui devuelve un objeto vacio porque no se montan
          desde una ruta: las URLs salian con "undefined" y fallaban siempre. */}
      {enEdicion && (
        <EditRiddle
          temaId={temaId}
          subtemaId={subtemaId}
          adivinanza={enEdicion}
          onClose={cerrarYRefrescar}
        />
      )}

      {enBorrado && (
        <EliminarAdivinanza
          temaId={temaId}
          subtemaId={subtemaId}
          adivinanza={enBorrado}
          onClose={cerrarYRefrescar}
        />
      )}
    </section>
  );
}

export default RiddleTable;
