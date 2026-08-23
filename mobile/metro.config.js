const path = require('node:path');

const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro dentro de un monorepo con npm workspaces.
 *
 * Por defecto Metro solo mira dentro de la carpeta del proyecto, asi que no
 * encontraria `@adivimat/shared`: npm lo instala como enlace simbolico en el
 * node_modules de la raiz, fuera de mobile/. Sin esta configuracion el paquete
 * compartido no resuelve y la app no arranca.
 */
const raizProyecto = __dirname;
const raizMonorepo = path.resolve(raizProyecto, '..');

const config = getDefaultConfig(raizProyecto);

/* Vigila todo el monorepo: al cambiar shared/, la app recarga. */
config.watchFolders = [raizMonorepo];

/* Donde buscar paquetes: primero el del propio proyecto, para que react y
   react-native se resuelvan a las versiones del movil (React 19) y no a las
   que usa la web en la raiz (React 18). */
config.resolver.nodeModulesPaths = [
  path.resolve(raizProyecto, 'node_modules'),
  path.resolve(raizMonorepo, 'node_modules'),
];

/* NO se desactiva la busqueda jerarquica.
 *
 * La documentacion de Expo la desactiva para monorepos, pero eso solo vale
 * cuando npm ha podido aplanar todas las dependencias en un unico
 * node_modules. Aqui no puede: la web usa React 18 y el movil React 19, de modo
 * que npm anida parte del arbol de Expo en
 * `mobile/node_modules/expo/node_modules/` (expo-asset, expo-font, y demas).
 *
 * Con la busqueda jerarquica desactivada, Metro no sube desde el modulo que
 * importa y esos paquetes anidados dejan de resolverse: el empaquetado falla
 * con "Unable to resolve module expo-asset".
 */

module.exports = config;
