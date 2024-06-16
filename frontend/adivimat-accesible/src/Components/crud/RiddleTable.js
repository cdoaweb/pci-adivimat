import React, { useState, useEffect } from 'react';
import EditRiddle from './EditRiddle';
import AddRiddle from './AddRiddle';
import axios from '../utils/axiosConfig';
import EliminarAdivinanza from './EliminarAdivinanza';

function RiddleTable({ temaId, subtema }) {
  const [adivinanzas, setAdivinanzas] = useState([]);
  const [selectedRiddle, setSelectedRiddle] = useState(null); // Estado para la adivinanza seleccionada
  const [isAdding, setIsAdding] = useState(false); // Estado para controlar el formulario de añadir
  const [isDeleting, setIsDeleting] = useState(null); // Estado para controlar el formulario de eliminar

  // Función para obtener las adivinanzas del backend
  const fetchAdivinanzas = async () => {
    try {
      const respuesta = await axios.get(`/api/temas/${temaId}/subtemas/${subtema}/adivinanzas`);
      setAdivinanzas(respuesta.data);
    } catch (error) {
      alert('Error al cargar las adivinanzas');
    }
  };

  // useEffect para obtener las adivinanzas cuando el componente se monta o cuando cambian temaId o subtema
  useEffect(() => {
    fetchAdivinanzas();
  }, [subtema, temaId]);

  // Función para cerrar el formulario de añadir adivinanza y refrescar la lista
  const handleAddClose = () => {
    setIsAdding(false);
    fetchAdivinanzas(); // Refrescar la lista de adivinanzas después de añadir una nueva
  };

  // Función para cerrar el formulario de editar adivinanza y refrescar la lista
  const handleEditClose = () => {
    setSelectedRiddle(null);
    fetchAdivinanzas(); // Refrescar la lista de adivinanzas después de editar una
  };

  // Función para cerrar el formulario de eliminar adivinanza y refrescar la lista
  const handleDeleteClose = () => {
    setIsDeleting(null);
    fetchAdivinanzas(); // Refrescar la lista de adivinanzas después de eliminar una
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
                <button onClick={() => setSelectedRiddle(adivinanza)}>Editar</button>
                <button onClick={() => setIsDeleting(adivinanza)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => setIsAdding(true)}>Añadir nueva adivinanza</button>

      {isAdding && (
        <div>
          <AddRiddle temaId={temaId} subtemaId={subtema} onClose={handleAddClose} />
        </div>
      )}

      {selectedRiddle && (
        <div>
          <EditRiddle
            temaId={temaId}
            subtemaId={subtema}
            adivinanzaId={selectedRiddle._id}
            onClose={handleEditClose}
          />
        </div>
      )}

      {isDeleting && (
        <div>
          <EliminarAdivinanza
            temaId={temaId}
            subtemaId={subtema}
            adivinanzaId={isDeleting._id}
            onClose={handleDeleteClose}
          />
        </div>
      )}
    </div>
  );
}

export default RiddleTable;
