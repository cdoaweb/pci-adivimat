import { NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { RootStackParamList } from './src/navegacion';
import Juego from './src/pantallas/Juego';
import Subtemas from './src/pantallas/Subtemas';
import Temas from './src/pantallas/Temas';
import { colores } from './src/tema';

const Stack = createNativeStackNavigator<RootStackParamList>();

/* Tema oscuro propio, para que la barra de navegacion no aparezca en blanco
   sobre el fondo oscuro de las pantallas. */
const temaNavegacion: Theme = {
  dark: true,
  colors: {
    primary: colores.acento,
    background: colores.fondo,
    card: colores.fondo,
    text: colores.texto,
    border: colores.tarjeta,
    notification: colores.acento,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '600' },
    heavy: { fontFamily: 'System', fontWeight: '700' },
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={temaNavegacion}>
        <StatusBar style="light" />
        <Stack.Navigator>
          <Stack.Screen name="Temas" component={Temas} options={{ title: 'Adivimat' }} />
          <Stack.Screen name="Subtemas" component={Subtemas} />
          <Stack.Screen name="Juego" component={Juego} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
