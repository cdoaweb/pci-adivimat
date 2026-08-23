import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  type Adivinanza,
  type EstadoAdivinanza,
  type OpcionRespuesta,
  INTENTOS_OPCION_MULTIPLE,
  INTENTOS_POR_DEFECTO,
  PUNTOS_POR_ACIERTO,
  PUNTOS_POR_ACIERTO_OPCIONES,
  estaResuelta,
  generarOpciones,
  registrarIntento,
  resumirProgreso,
} from '@adivimat/shared';

import { api, mensajeDeError } from '../../lib/api';
import { useProgreso } from '../../lib/useProgreso';
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
  /* Intentos gastados en la adivinanza actual, para anotarlos al terminarla. */
  const [intentosUsados, setIntentosUsados] = useState(0);
  const { progreso, registrar, reiniciar } = useProgreso();

  /* El reparto necesita el progreso mas reciente, pero no debe rehacerse cada
     vez que este cambia: se consulta por referencia en lugar de por dependencia. */
  const progresoRef = useRef(progreso);
  useEffect(() => {
    progresoRef.current = progreso;
  }, [progreso]);
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
      const restantes = bolsa.length > 0 ? bolsa : todas;
      if (restantes.length === 0) return;

      /* Primero lo que sigue sin resolver: repetir lo ya acertado no da puntos
         y aburre. Si no queda nada pendiente, se reparte de todo el subtema. */
      const sinResolver = restantes.filter((a) => !estaResuelta(progresoRef.current, a.id));
      const disponibles = sinResolver.length > 0 ? sinResolver : restantes;

      const indice = Math.floor(Math.random() * disponibles.length);
      const elegida = disponibles[indice];
      if (!elegida) return;

      const intentosBase = elegida.intentos || INTENTOS_POR_DEFECTO;

      setPendientes(restantes.filter((a) => a.id !== elegida.id));
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
      setIntentosUsados(0);
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

    const usados = intentosUsados + 1;
    setIntentosUsados(usados);

    if (resultado.correcta) {
      /* Los puntos solo se conceden la primera vez que se acierta cada
         adivinanza; de eso se encarga `registrarResultado`. */
      registrar(actual.id, { acertada: true, intentosUsados: usados, puntos: resultado.puntos });
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
      registrar(actual.id, { acertada: false, intentosUsados: usados, puntos: 0 });
      setAnnouncement(`Se acabaron los intentos. La respuesta es: ${actual.respuesta}`);
    } else {
      const n = resultado.intentosRestantes;
      setAnnouncement(`Incorrecto. Te queda${n === 1 ? '' : 'n'} ${n} intento${n === 1 ? '' : 's'}.`);
    }
  };

  const confirmarReinicio = () => {
    /* Es irreversible y no hay copia en ningun servidor: se pregunta antes. */
    if (window.confirm('Se borrara toda tu puntuacion. Esta accion no se puede deshacer.')) {
      reiniciar();
      setAnnouncement('Progreso borrado');
    }
  };

  const rendirse = () => {
    if (!estado || !actual) return;
    setEstado({ ...estado, intentos: 0, respuestaRevelada: true });
    registrar(actual.id, { acertada: false, intentosUsados, puntos: 0 });
    setAnnouncement(`La respuesta es: ${actual.respuesta}`);
  };

  if (isLoading) return <p>Cargando adivinanzas...</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!actual || !estado) return <p>No hay adivinanza disponible.</p>;

  const revelada = estado.respuestaRevelada;
  const yaResuelta = estaResuelta(progreso, actual.id);
  const avanceSubtema = resumirProgreso(progreso, adivinanzas.map((a) => a.id));
  const avanceTotal = resumirProgreso(progreso);

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

      <section>
        <h4>Tu progreso</h4>
        <p>
          Este subtema: {avanceSubtema.resueltas} de {adivinanzas.length} resueltas
          {avanceSubtema.resueltas === adivinanzas.length && adivinanzas.length > 0 && ' · completo'}
        </p>
        <p>
          En total: {avanceTotal.resueltas} adivinanzas resueltas y {avanceTotal.puntos} puntos
        </p>
        {yaResuelta && <p>Esta ya la habias resuelto; repetirla no suma puntos.</p>}
        <button onClick={confirmarReinicio}>Borrar mi progreso</button>
      </section>
    </div>
  );
}

export default RiddleSelector;
