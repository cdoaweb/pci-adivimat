import React, { useState, useEffect } from 'react';
import EditRiddle from './EditRiddle';
import AddRiddle from './AddRiddle';
import axios from '../utils/axiosConfig';

function RiddleTable({ temaId, subtema }) {
  const [adivinanzas, setAdivinanzas] = useState([]);
  const [selectedRiddle, setSelectedRiddle] = useState(null); // Estado para la adivinanza seleccionada
  const [isAdding, setIsAdding] = useState(false); // Estado para controlar el formulario de añadir

  const fetchAdivinanzas = async () => {
    try {
      const respuesta = await axios.get(`/api/temas/${temaId}/subtemas/${subtema}/adivinanzas`);
      setAdivinanzas(respuesta.data);
    } catch (error) {
      alert('Error al cargar las adivinanzas');
    }
  };

  useEffect(() => {
    fetchAdivinanzas();
  }, [subtema, temaId]);

  const eliminarAdivinanza = async (idAdivinanza) => {
    if (window.confirm('¿Estás seguro de querer eliminar esta adivinanza?')) {
      try {
        await axios.delete(`/api/temas/${temaId}/subtemas/${subtema}/adivinanzas/${idAdivinanza}`);
        setAdivinanzas(adivinanzas.filter(a => a._id !== idAdivinanza));
      } catch (error) {
        alert('Error al eliminar la adivinanza');
      }
    }
  };

  const editarAdivinanza = (adivinanza) => {
    setSelectedRiddle(adivinanza);
  };

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleAddClose = () => {
    setIsAdding(false);
    fetchAdivinanzas(); // Refrescar la lista de adivinanzas después de añadir una nueva
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Pregunta</th>
            <th>Respuesta</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {adivinanzas.map(adivinanza => (
            <tr key={adivinanza._id}>
              <td>{adivinanza.pregunta}</td>
              <td>{adivinanza.respuesta}</td>
              <td>
                <button onClick={() => editarAdivinanza(adivinanza)}>Editar</button>
                <button onClick={() => eliminarAdivinanza(adivinanza._id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAddClick}>Añadir Adivinanza</button>

      {isAdding && (
        <div>
          <AddRiddle temaId={temaId} subtemaId={subtema} onClose={handleAddClose} />
        </div>
      )}

      {selectedRiddle && (
        <div>
          <EditRiddle temaId={temaId} subtemaId={subtema} riddleId={selectedRiddle._id} />
        </div>
      )}
    </div>
  );
}

export default RiddleTable;
