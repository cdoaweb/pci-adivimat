import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { type Tema, resumirProgreso } from '@adivimat/shared';

import { apiGet, mensajeDeError } from '../lib/api';
import { useProgreso } from '../lib/useProgreso';
import type { RootStackParamList } from '../navegacion';
import { colores, estilosComunes } from '../tema';

type Props = NativeStackScreenProps<RootStackParamList, 'Temas'>;

export default function Temas({ navigation }: Props) {
  const [temas, setTemas] = useState<Tema[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { progreso } = useProgreso();

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setTemas(await apiGet<Tema[]>('/api/temas'));
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudieron cargar los temas'));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  if (cargando) {
    return (
      <View style={estilosComunes.centrado}>
        <ActivityIndicator size="large" color={colores.acento} />
        <Text style={estilosComunes.texto}>Cargando temas...</Text>
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

  const total = resumirProgreso(progreso);

  return (
    <View style={estilosComunes.pantalla}>
      <FlatList
        data={temas}
        keyExtractor={(tema) => tema.id}
        ListHeaderComponent={
          <Text style={estilosComunes.texto}>
            Llevas {total.resueltas} adivinanzas resueltas y {total.puntos} puntos.
          </Text>
        }
        renderItem={({ item }) => {
          const ids = item.subtemas.flatMap((s) => s.adivinanzas.map((a) => a.id));
          const avance = resumirProgreso(progreso, ids);

          return (
            <Pressable
              style={estilos.tarjeta}
              onPress={() =>
                navigation.navigate('Subtemas', { temaId: item.id, temaNombre: item.tema })
              }
              accessibilityRole="button"
              /* El lector de pantalla anuncia el avance junto al nombre: sin
                 esto solo diria el titulo y el progreso quedaria invisible. */
              accessibilityLabel={`${item.tema}. ${avance.resueltas} de ${ids.length} resueltas.`}
            >
              <Text style={estilos.titulo}>{item.tema}</Text>
              <Text style={estilos.subtitulo}>
                {item.subtemas.length} subtemas · {avance.resueltas} de {ids.length} resueltas
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
