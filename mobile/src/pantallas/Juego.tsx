import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

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

import { apiGet, mensajeDeError } from '../lib/api';
import { useProgreso } from '../lib/useProgreso';
import type { RootStackParamList } from '../navegacion';
import { colores, estilosComunes } from '../tema';

type Props = NativeStackScreenProps<RootStackParamList, 'Juego'>;
type Modo = 'escrita' | 'opciones';

const FALLOS_PARA_PISTA = 1;
const FALLOS_PARA_INICIAL = 2;

/**
 * La partida.
 *
 * Ni una sola regla del juego se reescribe aqui: comparar la respuesta,
 * descontar intentos, repartir senuelos y anotar el progreso son las mismas
 * funciones de `@adivimat/shared` que usan la web y el backend. Lo unico propio
 * de esta pantalla es como se pinta y como se anuncia a un lector de pantalla.
 */
export default function Juego({ route, navigation }: Props) {
  const { temaId, subtemaId, subtemaNombre } = route.params;

  const [adivinanzas, setAdivinanzas] = useState<Adivinanza[]>([]);
  const [pendientes, setPendientes] = useState<Adivinanza[]>([]);
  const [actual, setActual] = useState<Adivinanza | null>(null);
  const [estado, setEstado] = useState<EstadoAdivinanza | null>(null);
  const [opciones, setOpciones] = useState<OpcionRespuesta[]>([]);
  const [descartadas, setDescartadas] = useState<Set<string>>(new Set());
  const [respuesta, setRespuesta] = useState('');
  const [fallos, setFallos] = useState(0);
  const [intentosUsados, setIntentosUsados] = useState(0);
  const [modo, setModo] = useState<Modo>('escrita');
  const [aviso, setAviso] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { progreso, cargando: cargandoProgreso, registrar } = useProgreso();

  /* El reparto necesita el progreso mas reciente sin rehacerse cada vez que
     cambia, igual que en la web. */
  const progresoRef = useRef(progreso);
  useEffect(() => {
    progresoRef.current = progreso;
  }, [progreso]);

  useEffect(() => {
    navigation.setOptions({ title: subtemaNombre });
  }, [navigation, subtemaNombre]);

  const siguiente = useCallback(
    (bolsa: Adivinanza[], todas: Adivinanza[], modoActual: Modo) => {
      const restantes = bolsa.length > 0 ? bolsa : todas;
      if (restantes.length === 0) return;

      /* Primero lo que sigue sin resolver; repetir lo acertado no da puntos. */
      const sinResolver = restantes.filter((a) => !estaResuelta(progresoRef.current, a.id));
      const disponibles = sinResolver.length > 0 ? sinResolver : restantes;

      const elegida = disponibles[Math.floor(Math.random() * disponibles.length)];
      if (!elegida) return;

      const cupo = elegida.intentos || INTENTOS_POR_DEFECTO;

      setPendientes(restantes.filter((a) => a.id !== elegida.id));
      setActual(elegida);
      setEstado({
        respuesta: elegida.respuesta,
        respuestasAceptadas: elegida.respuestasAceptadas,
        intentos: modoActual === 'opciones' ? Math.min(cupo, INTENTOS_OPCION_MULTIPLE) : cupo,
        puntos: 0,
        respuestaRevelada: false,
      });
      setOpciones(
        modoActual === 'opciones'
          ? generarOpciones(
              elegida.respuesta,
              todas.map((a) => a.respuesta),
            )
          : [],
      );
      setDescartadas(new Set());
      setRespuesta('');
      setFallos(0);
      setIntentosUsados(0);
      setAviso(`Nueva adivinanza: ${elegida.pregunta}`);
    },
    [],
  );

  useEffect(() => {
    /* Se espera al progreso: repartir antes elegiria sin saber que hay resuelto. */
    if (cargandoProgreso) return;

    let vigente = true;
    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const datos = await apiGet<Adivinanza[]>(
          `/api/temas/${temaId}/subtemas/${subtemaId}/adivinanzas`,
        );
        if (!vigente) return;
        if (datos.length === 0) {
          setError('Este subtema todavia no tiene adivinanzas.');
        } else {
          setAdivinanzas(datos);
          siguiente(datos, datos, modo);
        }
      } catch (err) {
        if (vigente) setError(mensajeDeError(err, 'No se pudieron cargar las adivinanzas'));
      } finally {
        if (vigente) setCargando(false);
      }
    };

    void cargar();
    return () => {
      vigente = false;
    };
    /* `modo` se omite a proposito: cambiarlo reparte de nuevo por su cuenta, sin
       volver a pedir los datos a la API. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temaId, subtemaId, siguiente, cargandoProgreso]);

  const responder = (texto: string) => {
    if (!estado || !actual || !texto.trim()) return;

    const { estado: nuevo, resultado } = registrarIntento(
      estado,
      texto,
      modo === 'opciones' ? PUNTOS_POR_ACIERTO_OPCIONES : PUNTOS_POR_ACIERTO,
    );
    setEstado(nuevo);
    setRespuesta('');

    const usados = intentosUsados + 1;
    setIntentosUsados(usados);

    if (resultado.correcta) {
      registrar(actual.id, { acertada: true, intentosUsados: usados, puntos: resultado.puntos });
      setAviso(`Correcto: ${actual.respuesta}`);
      siguiente(pendientes, adivinanzas, modo);
      return;
    }

    setFallos((f) => f + 1);
    if (modo === 'opciones') {
      setDescartadas((d) => new Set(d).add(texto));
    }

    if (resultado.respuestaRevelada) {
      registrar(actual.id, { acertada: false, intentosUsados: usados, puntos: 0 });
      setAviso(`Se acabaron los intentos. La respuesta es: ${actual.respuesta}`);
    } else {
      const n = resultado.intentosRestantes;
      setAviso(`Incorrecto. Te queda${n === 1 ? '' : 'n'} ${n} intento${n === 1 ? '' : 's'}.`);
    }
  };

  const cambiarModo = (nuevo: Modo) => {
    setModo(nuevo);
    setAviso(nuevo === 'opciones' ? 'Modo de opciones' : 'Modo de respuesta escrita');
    siguiente(pendientes, adivinanzas, nuevo);
  };

  const rendirse = () => {
    if (!estado || !actual) return;
    setEstado({ ...estado, intentos: 0, respuestaRevelada: true });
    registrar(actual.id, { acertada: false, intentosUsados, puntos: 0 });
    setAviso(`La respuesta es: ${actual.respuesta}`);
  };

  if (cargando || cargandoProgreso) {
    return (
      <View style={estilosComunes.centrado}>
        <ActivityIndicator size="large" color={colores.acento} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={estilosComunes.centrado}>
        <Text style={estilosComunes.error} accessibilityRole="alert">
          {error}
        </Text>
      </View>
    );
  }

  if (!actual || !estado) {
    return (
      <View style={estilosComunes.centrado}>
        <Text style={estilosComunes.texto}>No hay adivinanza disponible.</Text>
      </View>
    );
  }

  const revelada = estado.respuestaRevelada;
  const mostrarPista = !revelada && Boolean(actual.pista) && fallos >= FALLOS_PARA_PISTA;
  /* Con las opciones a la vista, dar la inicial no aporta nada. */
  const mostrarInicial = !revelada && modo === 'escrita' && fallos >= FALLOS_PARA_INICIAL;

  const palabras = actual.respuesta.trim().split(/\s+/);
  const avance = resumirProgreso(
    progreso,
    adivinanzas.map((a) => a.id),
  );

  return (
    <ScrollView style={estilosComunes.pantalla} contentContainerStyle={estilos.contenido}>
      <View style={estilos.selectorModo}>
        {(['escrita', 'opciones'] as const).map((m) => (
          <Pressable
            key={m}
            style={[estilos.pestana, modo === m && estilos.pestanaActiva]}
            onPress={() => cambiarModo(m)}
            accessibilityRole="radio"
            accessibilityState={{ selected: modo === m }}
            accessibilityLabel={m === 'escrita' ? 'Escribir la respuesta' : 'Elegir entre opciones'}
          >
            <Text style={[estilos.textoPestana, modo === m && estilos.textoPestanaActiva]}>
              {m === 'escrita' ? 'Escribir' : 'Elegir'}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={estilos.cabecera}>
        {actual.numero !== undefined && `N.º ${actual.numero}`}
        {actual.dificultad === 'avanzada' && ' · avanzada'}
      </Text>

      <Text style={estilos.pregunta}>{actual.pregunta}</Text>

      {/* Lo que debe leerse en voz alta al cambiar, sin robar el foco. */}
      <Text
        style={estilos.aviso}
        accessibilityLiveRegion="polite"
        accessibilityRole="text"
      >
        {aviso}
      </Text>

      {mostrarPista && <Text style={estilos.pista}>Pista: {actual.pista}</Text>}
      {mostrarInicial && (
        <Text style={estilos.pista}>
          {palabras.length === 1
            ? `Empieza por "${palabras[0]?.[0]?.toUpperCase() ?? ''}" y tiene ${
                actual.respuesta.replace(/\s/g, '').length
              } letras.`
            : `Son ${palabras.length} palabras.`}
        </Text>
      )}

      {modo === 'escrita' ? (
        <View style={estilos.bloque}>
          <TextInput
            style={estilos.entrada}
            value={respuesta}
            onChangeText={setRespuesta}
            editable={!revelada}
            placeholder="Escribe tu respuesta"
            placeholderTextColor={colores.textoSuave}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={() => responder(respuesta)}
            returnKeyType="send"
            accessibilityLabel="Campo para escribir la respuesta"
          />
          <Pressable
            style={estilosComunes.boton}
            onPress={() => responder(respuesta)}
            disabled={revelada || !respuesta.trim()}
            accessibilityRole="button"
          >
            <Text style={estilosComunes.textoBoton}>Responder</Text>
          </Pressable>
        </View>
      ) : (
        <View style={estilos.bloque}>
          {opciones.map((opcion) => {
            const descartada = descartadas.has(opcion.texto);
            return (
              <Pressable
                key={opcion.texto}
                style={[estilos.opcion, descartada && estilos.opcionDescartada]}
                onPress={() => responder(opcion.texto)}
                disabled={revelada || descartada}
                accessibilityRole="button"
                accessibilityState={{ disabled: revelada || descartada }}
                accessibilityLabel={`${opcion.texto}${descartada ? '. Descartada.' : ''}`}
              >
                <Text style={[estilos.textoOpcion, descartada && estilos.textoDescartado]}>
                  {opcion.texto}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {revelada && <Text style={estilos.solucion}>La respuesta es: {actual.respuesta}</Text>}
      {!revelada && (
        <Text style={estilosComunes.textoSuave}>Intentos restantes: {estado.intentos}</Text>
      )}

      <View style={estilos.acciones}>
        {!revelada && (
          <Pressable
            style={estilosComunes.botonSecundario}
            onPress={rendirse}
            accessibilityRole="button"
          >
            <Text style={estilosComunes.textoBotonSecundario}>Ver respuesta</Text>
          </Pressable>
        )}
        <Pressable
          style={estilosComunes.botonSecundario}
          onPress={() => siguiente(pendientes, adivinanzas, modo)}
          accessibilityRole="button"
        >
          <Text style={estilosComunes.textoBotonSecundario}>
            {revelada ? 'Siguiente' : 'Saltar'}
          </Text>
        </Pressable>
      </View>

      <Text style={estilosComunes.textoSuave}>
        {avance.resueltas} de {adivinanzas.length} resueltas en este subtema
      </Text>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { gap: 12, paddingBottom: 32 },
  selectorModo: { flexDirection: 'row', gap: 8 },
  pestana: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colores.tarjeta,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  pestanaActiva: { backgroundColor: colores.acento },
  textoPestana: { color: colores.texto, fontWeight: '600' },
  textoPestanaActiva: { color: '#0b1017' },
  cabecera: { color: colores.textoSuave, fontSize: 14 },
  pregunta: { color: colores.texto, fontSize: 20, lineHeight: 30 },
  aviso: { color: colores.acento, fontSize: 15, minHeight: 22 },
  pista: { color: colores.textoSuave, fontSize: 15, fontStyle: 'italic' },
  bloque: { gap: 10 },
  entrada: {
    backgroundColor: colores.tarjeta,
    color: colores.texto,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    minHeight: 44,
  },
  opcion: {
    backgroundColor: colores.tarjeta,
    borderRadius: 10,
    padding: 16,
    minHeight: 44,
    justifyContent: 'center',
  },
  opcionDescartada: { opacity: 0.45 },
  textoOpcion: { color: colores.texto, fontSize: 16 },
  textoDescartado: { textDecorationLine: 'line-through' },
  solucion: { color: colores.acierto, fontSize: 17, fontWeight: '600' },
  acciones: { flexDirection: 'row', gap: 10 },
});
