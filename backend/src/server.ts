import mongoose from 'mongoose';

import { createApp } from './app';
import { aplicarDnsPersonalizado, config } from './config/env';

/** Arranca el servidor: primero la base de datos, despues el puerto. */
async function main(): Promise<void> {
  aplicarDnsPersonalizado();
  await mongoose.connect(config.mongoUri);
  console.log('Conexion exitosa a MongoDB');

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`Servidor corriendo en http://localhost:${config.port}`);
  });

  /* Docker envia SIGTERM al parar el contenedor: se cierran las conexiones
     antes de salir para no dejar peticiones a medias. */
  const apagar = (senal: string) => {
    void (async () => {
      console.log(`${senal} recibido, cerrando...`);
      server.close();
      await mongoose.disconnect();
      process.exit(0);
    })();
  };

  process.on('SIGTERM', () => apagar('SIGTERM'));
  process.on('SIGINT', () => apagar('SIGINT'));
}

/* Si la conexion o la configuracion fallan, el proceso muere con codigo 1 en
   lugar de quedarse escuchando contra una base de datos inexistente. */
main().catch((error: unknown) => {
  console.error('No se pudo arrancar el servidor:', error);
  process.exit(1);
});
