import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { type Subtema, resumirProgreso } from '@adivimat/shared';

import { apiGet, mensajeDeError } from '../lib/api';
import { useProgreso } from '../lib/useProgreso';
import type { RootStackParamList } from '../navegacion';
import { colores, estilosComunes } from '../tema';

type Props = NativeStackScreenProps<RootStackParamList, 'Subtemas'>;

export default function Subtemas({ route, navigation }: Props) {
  const { temaId, temaNombre } = route.params;
  const [subtemas, setSubtemas] = useState<Subtema[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { progreso } = useProgreso();

  /* El titulo de la barra lo pone la pantalla, no el navegador: solo aqui se
     sabe de que tema se trata. */
  useEffect(() => {
    navigation.setOptions({ title: temaNombre });
  }, [navigation, temaNombre]);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setSubtemas(await apiGet<Subtema[]>(`/api/temas/${temaId}/subtemas`));
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudieron cargar los subtemas'));
    } finally {
      setCargando(false);
    }
  }, [temaId]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  if (cargando) {
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
        <Pressable
          style={estilosComunes.boton}
          onPress={() => void cargar()}
          accessibilityRole="button"
        >
          <Text style={estilosComunes.textoBoton}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={estilosComunes.pantalla}>
      <FlatList
        data={subtemas}
        keyExtractor={(subtema) => subtema.id}
        ListEmptyComponent={
          <Text style={estilosComunes.texto}>Este tema todavia no tiene subtemas.</Text>
        }
        renderItem={({ item }) => {
          const ids = item.adivinanzas.map((a) => a.id);
          const avance = resumirProgreso(progreso, ids);
          const completo = ids.length > 0 && avance.resueltas === ids.length;

          return (
            <Pressable
              style={estilos.tarjeta}
              onPress={() =>
                navigation.navigate('Juego', {
                  temaId,
                  subtemaId: item.id,
                  subtemaNombre: item.name,
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`${item.name}. ${avance.resueltas} de ${ids.length} resueltas.${
                completo ? ' Subtema completo.' : ''
              }`}
            >
              <Text style={estilos.titulo}>
                {item.name}
                {completo && ' ✓'}
              </Text>
              <Text style={estilos.subtitulo}>
                {avance.resueltas} de {ids.length} resueltas
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.tarjeta,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  titulo: { fontSize: 18, fontWeight: '600', color: colores.texto },
  subtitulo: { fontSize: 14, color: colores.textoSuave, marginTop: 4 },
});
