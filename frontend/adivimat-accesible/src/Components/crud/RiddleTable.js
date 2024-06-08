import React, { useState, useEffect } from 'react';
import EditRiddle from './EditRiddle';
import axios from '../utils/axiosConfig'

function RiddleTable({ temaId, subtema }) {
  const [adivinanzas, setAdivinanzas] = useState([]);

  console.log(subtema);
  useEffect(() => {
    const fetchAdivinanzas = async () => {
      try {
        const respuesta = await axios.get(`/api/temas/${temaId}/subtemas/${subtema}/adivinanzas`);
        setAdivinanzas(respuesta.data);
      } catch (error) {
        alert('Error al cargar las adivinanzas');
      }
    };

    fetchAdivinanzas();
  }, [subtema]);

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

  };

  return (
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
              <button onClick={(EditRiddle) => editarAdivinanza(adivinanza)}>Editar</button>
              <button onClick={() => eliminarAdivinanza(adivinanza._id)}>Eliminar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default RiddleTable;
