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
 * la solucion) no viven aqui: las aporta `registrarIntento` de
 * `@adivimat/shared`, la misma funcion que usa el backend. Antes este
 * componente tenia su propia copia, con un `maxAttempts` fijo en 5 que ignoraba
 * los intentos de cada adivinanza y una comparacion que no recortaba espacios
 * ni tildes, de modo que la misma respuesta podia aceptarse en el servidor y
 * rechazarse aqui.
 *
 * Se resuelve en el cliente a proposito: es la misma logica que reutilizara la
 * app movil para poder jugar sin conexion.
 */
interface RiddleSelectorProps {
  temaId: string;
  subtemaId: string;
}

/** Intentos fallados antes de ofrecer cada ayuda. */
const FALLOS_PARA_PISTA = 1;
const FALLOS_PARA_INICIAL = 2;

/** Marcador de la sesion, para dar sensacion de progreso. */
interface Marcador {
  acertadas: number;
  jugadas: number;
  puntos: number;
}

function RiddleSelector({ temaId, subtemaId }: RiddleSelectorProps) {
  const [adivinanzas, setAdivinanzas] = useState<Adivinanza[]>([]);
  const [pendientes, setPendientes] = useState<Adivinanza[]>([]);
  const [actual, setActual] = useState<Adivinanza | null>(null);
  const [estado, setEstado] = useState<EstadoAdivinanza | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [fallos, setFallos] = useState(0);
  const [marcador, setMarcador] = useState<Marcador>({ acertadas: 0, jugadas: 0, puntos: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  /**
   * Toma la siguiente adivinanza de la baraja.
   *
   * Se reparte de una bolsa que se va vaciando, en lugar de sortear cada vez:
   * al azar puro salia la misma adivinanza dos veces seguidas y otras no salian
   * nunca. Cuando la bolsa se agota, se vuelve a barajar el subtema entero.
   */
  const siguiente = useCallback(
    (bolsa: Adivinanza[], todas: Adivinanza[]) => {
      const disponibles = bolsa.length > 0 ? bolsa : todas;
      if (disponibles.length === 0) return;

      const indice = Math.floor(Math.random() * disponibles.length);
      const elegida = disponibles[indice];
      if (!elegida) return;

      setPendientes(disponibles.filter((_, i) => i !== indice));
      setActual(elegida);
      setEstado({
        respuesta: elegida.respuesta,
        respuestasAceptadas: elegida.respuestasAceptadas,
        intentos: elegida.intentos || INTENTOS_POR_DEFECTO,
        puntos: 0,
        respuestaRevelada: false,
      });
      setUserAnswer('');
      setFallos(0);
      setAnnouncement(`Nueva adivinanza: ${elegida.pregunta}`);
    },
    [],
  );

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
          setMarcador({ acertadas: 0, jugadas: 0, puntos: 0 });
          siguiente(data, data);
        }
      } catch (err) {
        setError(mensajeDeError(err, 'Error al cargar las adivinanzas, intente de nuevo mas tarde.'));
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAdivinanzas();
  }, [temaId, subtemaId, siguiente]);

  const responder = () => {
    if (!estado || !actual || !userAnswer.trim()) return;

    const { estado: nuevo, resultado } = registrarIntento(estado, userAnswer);
    setEstado(nuevo);
    setUserAnswer('');

    if (resultado.correcta) {
      setMarcador((m) => ({
        acertadas: m.acertadas + 1,
        jugadas: m.jugadas + 1,
        puntos: m.puntos + resultado.puntos,
      }));
      setAnnouncement(`Correcto: ${actual.respuesta}. Vamos con la siguiente.`);
      siguiente(pendientes, adivinanzas);
      return;
    }

    setFallos((f) => f + 1);

    if (resultado.respuestaRevelada) {
      setMarcador((m) => ({ ...m, jugadas: m.jugadas + 1 }));
      setAnnouncement(`Se acabaron los intentos. La respuesta es: ${actual.respuesta}`);
    } else {
      setAnnouncement(`Incorrecto. Te quedan ${resultado.intentosRestantes} intentos.`);
    }
  };

  const rendirse = () => {
    if (!estado || !actual) return;
    setEstado({ ...estado, intentos: 0, respuestaRevelada: true });
    setMarcador((m) => ({ ...m, jugadas: m.jugadas + 1 }));
    setAnnouncement(`La respuesta es: ${actual.respuesta}`);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      responder();
    }
  };

  if (isLoading) return <p>Cargando adivinanzas...</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!actual || !estado) return <p>No hay adivinanza disponible.</p>;

  const revelada = estado.respuestaRevelada;

  /* Ayudas escalonadas: primero el matiz del libro, despues la forma de la
     respuesta. Solo aparecen tras fallar, para no regalarlas de entrada. */
  const mostrarPista = !revelada && Boolean(actual.pista) && fallos >= FALLOS_PARA_PISTA;
  const mostrarInicial = !revelada && fallos >= FALLOS_PARA_INICIAL;

  const palabras = actual.respuesta.trim().split(/\s+/);
  const esqueleto = palabras
    .map((p, i) => (i === 0 ? `${p[0]?.toUpperCase() ?? ''}${'_'.repeat(Math.max(p.length - 1, 0))}` : '_'.repeat(p.length)))
    .join(' ');

  return (
    <div>
      <h3>
        Adivinanza
        {actual.numero !== undefined && ` n.º ${actual.numero}`}
        {actual.dificultad === 'avanzada' && ' · avanzada'}
      </h3>

      {/* El verso se respeta tal cual: los saltos de linea son parte de la
          adivinanza, no formato accidental. */}
      <p style={{ whiteSpace: 'pre-line' }}>{actual.pregunta}</p>

      <div aria-live="polite">{announcement}</div>

      {mostrarPista && <p>Pista: {actual.pista}</p>}
      {mostrarInicial && (
        <p>
          {palabras.length === 1
            ? `Empieza por "${palabras[0]?.[0]?.toUpperCase() ?? ''}" y tiene ${actual.respuesta.replace(/\s/g, '').length} letras.`
            : `Son ${palabras.length} palabras: ${esqueleto}`}
        </p>
      )}

      <label htmlFor="respuesta-usuario">Escribe tu respuesta</label>
      <input
        id="respuesta-usuario"
        type="text"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        disabled={revelada}
        placeholder="Ingrese su respuesta"
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      <button onClick={responder} disabled={revelada || !userAnswer.trim()}>
        Responder
      </button>
      {!revelada && <button onClick={rendirse}>Ver respuesta</button>}
      <button onClick={() => siguiente(pendientes, adivinanzas)}>
        {revelada ? 'Siguiente' : 'Saltar'}
      </button>

      {revelada && <p>La respuesta es: {actual.respuesta}</p>}

      {!revelada && <p>Intentos restantes: {estado.intentos}</p>}

      <p>
        Aciertos: {marcador.acertadas} de {marcador.jugadas} · Puntos: {marcador.puntos} · Quedan{' '}
        {pendientes.length} de {adivinanzas.length} en este subtema
      </p>
    </div>
  );
}

export default RiddleSelector;
