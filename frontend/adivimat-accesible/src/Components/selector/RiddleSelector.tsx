import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  type Adivinanza,
  type EstadoAdivinanza,
  type OpcionRespuesta,
  INTENTOS_OPCION_MULTIPLE,
  INTENTOS_POR_DEFECTO,
  PUNTOS_POR_ACIERTO,
  PUNTOS_POR_ACIERTO_OPCIONES,
  generarOpciones,
  registrarIntento,
} from '@adivimat/shared';

import { api, mensajeDeError } from '../../lib/api';
import RespuestaEscrita from './RespuestaEscrita';
import RespuestaOpciones from './RespuestaOpciones';

/**
 * Juego de adivinanzas, con dos formas de responder.
 *
 * Las reglas (comparar, descontar intentos, sumar puntos, revelar) no viven
 * aqui: las aporta `registrarIntento` de `@adivimat/shared`, la misma funcion
 * que usa el backend, y la misma que reutilizara la app movil para jugar sin
 * conexion.
 */
interface RiddleSelectorProps {
  temaId: string;
  subtemaId: string;
}

type Modo = 'escrita' | 'opciones';

const CLAVE_MODO = 'adivimat:modo-respuesta';

/** Intentos fallados antes de ofrecer cada ayuda. */
const FALLOS_PARA_PISTA = 1;
const FALLOS_PARA_INICIAL = 2;

interface Marcador {
  acertadas: number;
  jugadas: number;
  puntos: number;
}

function leerModo(): Modo {
  return localStorage.getItem(CLAVE_MODO) === 'opciones' ? 'opciones' : 'escrita';
}

function RiddleSelector({ temaId, subtemaId }: RiddleSelectorProps) {
  const [adivinanzas, setAdivinanzas] = useState<Adivinanza[]>([]);
  const [pendientes, setPendientes] = useState<Adivinanza[]>([]);
  const [actual, setActual] = useState<Adivinanza | null>(null);
  const [estado, setEstado] = useState<EstadoAdivinanza | null>(null);
  const [opciones, setOpciones] = useState<OpcionRespuesta[]>([]);
  const [descartadas, setDescartadas] = useState<Set<string>>(new Set());
  const [fallos, setFallos] = useState(0);
  const [marcador, setMarcador] = useState<Marcador>({ acertadas: 0, jugadas: 0, puntos: 0 });
  const [modo, setModo] = useState<Modo>(leerModo);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  /* Bolsa de senuelos: el resto de respuestas del subtema. Del mismo subtema y
     no del temario entero, porque una respuesta de geometria dentro de una
     pregunta de funciones se descarta sin leer el enunciado. */
  const respuestasDelSubtema = useMemo(
    () => adivinanzas.map((a) => a.respuesta),
    [adivinanzas],
  );

  /**
   * Reparte la siguiente adivinanza.
   *
   * Se saca de una bolsa que se va vaciando, en lugar de sortear cada vez: al
   * azar puro salia la misma dos veces seguidas y otras no salian nunca.
   */
  const siguiente = useCallback(
    (bolsa: Adivinanza[], todas: Adivinanza[], modoActual: Modo, pool: string[]) => {
      const disponibles = bolsa.length > 0 ? bolsa : todas;
      if (disponibles.length === 0) return;

      const indice = Math.floor(Math.random() * disponibles.length);
      const elegida = disponibles[indice];
      if (!elegida) return;

      const intentosBase = elegida.intentos || INTENTOS_POR_DEFECTO;

      setPendientes(disponibles.filter((_, i) => i !== indice));
      setActual(elegida);
      setEstado({
        respuesta: elegida.respuesta,
        respuestasAceptadas: elegida.respuestasAceptadas,
        /* Con cuatro opciones a la vista, los cinco o siete intentos del modo
           escrito permitirian acertar por descarte sin saber la respuesta. */
        intentos:
          modoActual === 'opciones'
            ? Math.min(intentosBase, INTENTOS_OPCION_MULTIPLE)
            : intentosBase,
        puntos: 0,
        respuestaRevelada: false,
      });
      setOpciones(
        modoActual === 'opciones' ? generarOpciones(elegida.respuesta, pool) : [],
      );
      setDescartadas(new Set());
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
          siguiente(data, data, leerModo(), data.map((a) => a.respuesta));
        }
      } catch (err) {
        setError(mensajeDeError(err, 'Error al cargar las adivinanzas, intente de nuevo mas tarde.'));
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAdivinanzas();
  }, [temaId, subtemaId, siguiente]);

  const pasarASiguiente = () => {
    siguiente(pendientes, adivinanzas, modo, respuestasDelSubtema);
  };

  /* Cambiar de modo reparte otra adivinanza: mantener la actual dejaria el
     numero de intentos del modo anterior, que son distintos. */
  const cambiarModo = (nuevo: Modo) => {
    localStorage.setItem(CLAVE_MODO, nuevo);
    setModo(nuevo);
    setAnnouncement(
      nuevo === 'opciones' ? 'Modo de opciones activado' : 'Modo de respuesta escrita activado',
    );
    siguiente(pendientes, adivinanzas, nuevo, respuestasDelSubtema);
  };

  const responder = (texto: string) => {
    if (!estado || !actual) return;

    const { estado: nuevo, resultado } = registrarIntento(
      estado,
      texto,
      modo === 'opciones' ? PUNTOS_POR_ACIERTO_OPCIONES : PUNTOS_POR_ACIERTO,
    );
    setEstado(nuevo);

    if (resultado.correcta) {
      setMarcador((m) => ({
        acertadas: m.acertadas + 1,
        jugadas: m.jugadas + 1,
        puntos: m.puntos + resultado.puntos,
      }));
      setAnnouncement(`Correcto: ${actual.respuesta}. Vamos con la siguiente.`);
      pasarASiguiente();
      return;
    }

    setFallos((f) => f + 1);
    /* En opciones, la fallada se tacha para no volver a elegirla por error. */
    if (modo === 'opciones') {
      setDescartadas((d) => new Set(d).add(texto));
    }

    if (resultado.respuestaRevelada) {
      setMarcador((m) => ({ ...m, jugadas: m.jugadas + 1 }));
      setAnnouncement(`Se acabaron los intentos. La respuesta es: ${actual.respuesta}`);
    } else {
      const n = resultado.intentosRestantes;
      setAnnouncement(`Incorrecto. Te queda${n === 1 ? '' : 'n'} ${n} intento${n === 1 ? '' : 's'}.`);
    }
  };

  const rendirse = () => {
    if (!estado || !actual) return;
    setEstado({ ...estado, intentos: 0, respuestaRevelada: true });
    setMarcador((m) => ({ ...m, jugadas: m.jugadas + 1 }));
    setAnnouncement(`La respuesta es: ${actual.respuesta}`);
  };

  if (isLoading) return <p>Cargando adivinanzas...</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!actual || !estado) return <p>No hay adivinanza disponible.</p>;

  const revelada = estado.respuestaRevelada;

  /* Ayudas escalonadas, solo tras fallar, para no regalarlas de entrada. */
  const mostrarPista = !revelada && Boolean(actual.pista) && fallos >= FALLOS_PARA_PISTA;
  /* La inicial no aporta nada si las respuestas ya estan a la vista. */
  const mostrarInicial = !revelada && modo === 'escrita' && fallos >= FALLOS_PARA_INICIAL;

  const palabras = actual.respuesta.trim().split(/\s+/);
  const esqueleto = palabras
    .map((p, i) =>
      i === 0
        ? `${p[0]?.toUpperCase() ?? ''}${'_'.repeat(Math.max(p.length - 1, 0))}`
        : '_'.repeat(p.length),
    )
    .join(' ');

  return (
    <div>
      <fieldset>
        <legend>Como quieres responder</legend>
        <div>
          <input
            type="radio"
            id="modo-escrita"
            name="modo-respuesta"
            checked={modo === 'escrita'}
            onChange={() => cambiarModo('escrita')}
          />
          <label htmlFor="modo-escrita">Escribiendo la respuesta</label>
        </div>
        <div>
          <input
            type="radio"
            id="modo-opciones"
            name="modo-respuesta"
            checked={modo === 'opciones'}
            onChange={() => cambiarModo('opciones')}
          />
          <label htmlFor="modo-opciones">Eligiendo entre varias opciones</label>
        </div>
      </fieldset>

      <h3>
        Adivinanza
        {actual.numero !== undefined && ` n.º ${actual.numero}`}
        {actual.dificultad === 'avanzada' && ' · avanzada'}
      </h3>

      {/* El verso se respeta: los saltos de linea son parte de la adivinanza. */}
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

      {modo === 'opciones' ? (
        <RespuestaOpciones
          opciones={opciones}
          descartadas={descartadas}
          bloqueado={revelada}
          onResponder={responder}
        />
      ) : (
        <RespuestaEscrita bloqueado={revelada} onResponder={responder} />
      )}

      {!revelada && <button onClick={rendirse}>Ver respuesta</button>}
      <button onClick={pasarASiguiente}>{revelada ? 'Siguiente' : 'Saltar'}</button>

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
