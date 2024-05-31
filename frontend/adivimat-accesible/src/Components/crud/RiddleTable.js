import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig'

function RiddleTable({ theme, subtheme  }) {
  const [adivinanzas, setAdivinanzas] = useState([]);

  console.log(subtheme);
  useEffect(() => {
    const fetchAdivinanzas = async () => {
      try {
        const respuesta = await axios.get(`/api/temas/${theme._id}/subtemas/${subtheme.name}/adivinanzas`);
        setAdivinanzas(respuesta.data);
      } catch (error) {
        alert('Error al cargar las adivinanzas');
      }
    };

    fetchAdivinanzas();
  }, [subtheme]);

  const eliminarAdivinanza = async (idAdivinanza) => {
    if (window.confirm('¿Estás seguro de querer eliminar esta adivinanza?')) {
      try {
        await axios.delete(`/api/subtemas/${subtheme._id}/adivinanzas/${idAdivinanza}`);
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
              <button onClick={() => editarAdivinanza(adivinanza)}>Editar</button>
              <button onClick={() => eliminarAdivinanza(adivinanza._id)}>Eliminar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default RiddleTable;