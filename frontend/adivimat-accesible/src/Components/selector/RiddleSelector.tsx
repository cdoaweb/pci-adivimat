import { type KeyboardEvent, useCallback, useEffect, useState } from 'react';

import {
  type Adivinanza,
  type EstadoAdivinanza,
  INTENTOS_POR_DEFECTO,
  registrarIntento,
} from '@adivimat/shared';

import { api, mensajeDeError } from '../../lib/api';

/**
 * Juego de adivinanzas.
 *
 * Las reglas (comparar la respuesta, descontar intentos, sumar puntos, revelar
 * la solucion) ya no viven aqui: las aporta `registrarIntento` de
 * `@adivimat/shared`, la misma funcion que usa el backend. Antes este
 * componente tenia su propia copia, con un `maxAttempts` fijo en 5 que ignoraba
 * los intentos configurados en cada adivinanza y una comparacion que no
 * recortaba espacios, de modo que la misma respuesta podia aceptarse en el
 * servidor y rechazarse aqui.
 *
 * Se resuelve en el cliente a proposito: es la misma logica que reutilizara la
 * app movil para poder jugar sin conexion.
 */
interface RiddleSelectorProps {
  temaId: string;
  subtemaId: string;
}

function RiddleSelector({ temaId, subtemaId }: RiddleSelectorProps) {
  const [adivinanzas, setAdivinanzas] = useState<Adivinanza[]>([]);
  const [actual, setActual] = useState<Adivinanza | null>(null);
  const [estado, setEstado] = useState<EstadoAdivinanza | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const elegirAdivinanza = useCallback((disponibles: Adivinanza[]) => {
    const indice = Math.floor(Math.random() * disponibles.length);
    const elegida = disponibles[indice];
    if (!elegida) return;

    setActual(elegida);
    /* Cada adivinanza arranca con sus propios intentos; el valor por defecto
       solo entra si el backend no lo trae. */
    setEstado({
      respuesta: elegida.respuesta,
      intentos: elegida.intentos || INTENTOS_POR_DEFECTO,
      puntos: 0,
      respuestaRevelada: false,
    });
    setUserAnswer('');
    setAnnouncement(`Nueva adivinanza: ${elegida.pregunta}`);
  }, []);

  useEffect(() => {
    const fetchAdivinanzas = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await api.get<Adivinanza[]>(
          `/api/temas/${temaId}/subtemas/${subtemaId}/adivinanzas`,
        );
        if (data.length === 0) {
          setError('No se encontraron adivinanzas para el subtema seleccionado.');
          setActual(null);
        } else {
          setAdivinanzas(data);
          elegirAdivinanza(data);
        }
      } catch (err) {
        setError(mensajeDeError(err, 'Error al cargar las adivinanzas, intente de nuevo mas tarde.'));
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAdivinanzas();
  }, [temaId, subtemaId, elegirAdivinanza]);

  const handleAnswerSubmit = () => {
    if (!estado || !actual) return;

    const { estado: siguiente, resultado } = registrarIntento(estado, userAnswer);
    setEstado(siguiente);
    setUserAnswer('');

    if (resultado.correcta) {
      setAnnouncement('Correcto! Bien hecho!');
      elegirAdivinanza(adivinanzas);
      return;
    }

    setAnnouncement(
      resultado.respuestaRevelada
        ? `Lo siento, has agotado tus intentos. La respuesta es: ${actual.respuesta}`
        : `Incorrecto. Te quedan ${resultado.intentosRestantes} intentos.`,
    );
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAnswerSubmit();
    }
  };

  if (isLoading) {
    return <p>Cargando adivinanzas...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (!actual || !estado) {
    return <p>No hay adivinanza disponible.</p>;
  }

  const revelada = estado.respuestaRevelada;

  return (
    <div>
      <h3>Adivinanza:</h3>
      <p>{actual.pregunta}</p>

      <div aria-live="polite">{announcement}</div>

      <label htmlFor="respuesta-usuario">Escribe tu respuesta</label>
      <input
        id="respuesta-usuario"
        type="text"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        disabled={revelada}
        placeholder="Ingrese su respuesta"
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleAnswerSubmit} disabled={revelada}>
        Responder
      </button>
      <button onClick={() => elegirAdivinanza(adivinanzas)}>Saltar</button>

      {revelada && <p>La respuesta es: {actual.respuesta}</p>}
      <p>Intentos restantes: {estado.intentos}</p>
    </div>
  );
}

export default RiddleSelector;
