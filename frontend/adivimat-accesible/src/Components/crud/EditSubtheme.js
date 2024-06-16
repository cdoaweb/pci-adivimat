import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig'
import { useParams, useNavigate } from 'react-router-dom';

const EditSubtheme = () => {
    const { temaId, subtemaId } = useParams();
    const navigate = useNavigate();
    const [subtema, setSubtema] = useState({ name: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`/api/temas/${temaId}/subtemas`)
            .then(response => {
                const subtemaEncontrado = response.data.find(st => st._id === subtemaId);
                if (subtemaEncontrado) {
                    setSubtema(subtemaEncontrado);
                } else {
                    alert('Subtema no encontrado');
                    navigate(`/temas/${temaId}`);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error al obtener los subtemas:', error);
                setLoading(false);
            });
    }, [temaId, subtemaId, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSubtema({ ...subtema, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.put(`/api/temas/${temaId}/subtemas/${subtemaId}`, subtema)
            .then(response => {
                alert('Subtema actualizado exitosamente');
                navigate(`/temas/${temaId}`);
            })
            .catch(error => {
                console.error('Error al actualizar el subtema:', error);
                alert('Error al actualizar el subtema');
            });
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div>
            <h2>Editar Subtema</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre:</label>
                    <input
                        type="text"
                        name="nombre"
                        value={subtema.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Guardar Cambios</button>
            </form>
        </div>
    );
};

export default EditSubtheme;
