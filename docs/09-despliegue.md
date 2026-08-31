# Despliegue

La aplicación son dos piezas que se despliegan por separado:

- **El cliente web**: archivos estáticos. Va en Cloudflare Pages.
- **La API**: un proceso Node que mantiene abierta la conexión con MongoDB. **No
  puede ir en Pages**, y conviene entender por qué antes de intentarlo.

## Por qué Cloudflare Pages y no Vercel

Los dos sirven un paquete estático sin esfuerzo. La diferencia, para este
proyecto:

- Los dominios `disvimat.net` y `disvimat.org` **ya están detrás de
  Cloudflare**, así que añadir un dominio personalizado en Pages no exige tocar
  servidores de nombres.
- El plan gratuito de Pages no limita el ancho de banda. El de Vercel lo deja en
  100 GB y su capa Hobby es de uso no comercial.

Vercel gana en despliegues de vista previa por cada pull request, pero eso
importa en equipos, no en un proyecto de un solo desarrollador.

## Por qué la API no cabe en ninguno de los dos

- **Pages Functions** se ejecuta sobre el motor de Workers, donde Mongoose no
  funciona bien: necesita una conexión TCP persistente.
- **Vercel Functions** sí ejecuta Node, pero cada arranque en frío abre una
  conexión nueva contra Atlas y agota su límite de conexiones.

Dos alternativas razonables:

| Opción | A favor | En contra |
| --- | --- | --- |
| **Cloudflare Tunnel** desde una máquina propia | Coste cero; el backend sigue siendo el contenedor de siempre | Esa máquina tiene que estar encendida |
| **Render, Railway o Fly.io** | Ejecutan el `Dockerfile` tal cual; siempre disponible | En los planes gratuitos el servicio duerme y el primer acceso tarda |

## El dominio

**`adivimat.disvimat.net`**.

`disvimat.net` es el sitio institucional, *"Matemática y estudiantes con
discapacidad visual"*, que es exactamente el asunto de esta aplicación.
`disvimat.org` está dedicado al podcast, un formato distinto. Además, la propia
página *Acerca de* ya enlaza a `disvimat.net/acerca-de`.

## Configurar Cloudflare Pages

Al conectar el repositorio, estos son los valores:

| Ajuste | Valor |
| --- | --- |
| Framework preset | None |
| Root directory | *(la raíz del repositorio)* |
| Build command | `npm run build:web` |
| Build output directory | `frontend/adivimat-accesible/dist` |
| Node version | `22` |

El directorio raíz es el del repositorio, no `frontend/`, porque es un monorepo:
el cliente depende del paquete `shared`, que hay que compilar antes.
`build:web` hace justo eso y se salta el backend, que no se despliega aquí.

### Variables de entorno

Se definen como variables **de compilación**, no de ejecución:

```
VITE_API_URL = https://<dominio-de-tu-api>
```

Esto es lo que más se atraganta y conviene entenderlo bien: en Vite, las
variables `VITE_*` se **incrustan en el paquete durante la compilación**. No se
leen al arrancar. Compilando sin ella, dentro del JavaScript queda escrito
`http://localhost:4000/`, y el sitio desplegado intentará llamar al ordenador de
cada visitante.

Cambiar la URL de la API obliga a **recompilar y volver a desplegar**.

## Las rutas del cliente

`frontend/adivimat-accesible/public/_redirects` contiene:

```
/*    /index.html   200
```

Sin esa regla, entrar directo a `/gestion` o recargar esa página devuelve un
404: Pages busca un archivo con ese nombre y en el disco no existe. Es el
equivalente del `try_files $uri $uri/ /index.html` que usa la imagen de Docker.

El código `200` importa. Con un 301 o un 302 el navegador cambiaría la URL y
React Router perdería la ruta a la que se quería ir.

Vite copia `public/` tal cual a `dist/`, así que el archivo llega solo.

## Configurar la API

Sea cual sea el destino, estas variables tienen que estar puestas:

```
MONGO_URI=mongodb+srv://usuario:contraseña@cluster.xxxxx.mongodb.net/adivimat?retryWrites=true&w=majority
JWT_SECRET=(generado con crypto.randomBytes)
ADMIN_CODE=(solo sirve para el alta del primer administrador)
PORT=4000
NODE_ENV=production
CORS_ORIGINS=https://adivimat.disvimat.net
```

`CORS_ORIGINS` **tiene que incluir el dominio del cliente**. Si falta, el
backend cae en su valor por defecto, `http://localhost:3000`, y el navegador
bloqueará todas las peticiones del sitio desplegado. Acepta varios orígenes
separados por comas, lo que sirve para tener producción y pruebas a la vez.

En Atlas, **Network Access** tiene que autorizar la IP desde la que se conecta
la API. Si el proveedor no da una IP fija, hay que permitir `0.0.0.0/0`, lo que
obliga a que la contraseña sea fuerte, porque la única barrera pasa a ser esa.

### Cargar el temario

Una vez desplegada la API, la base de datos está vacía:

```bash
MONGO_URI="<la de produccion>" npm run seed --workspace backend
```

El JSON del temario no se versiona. Hay que regenerarlo desde el PDF del libro
antes de cargarlo; el propio script explica cómo si no lo encuentra.

## La app móvil

Apunta al backend con:

```
EXPO_PUBLIC_API_URL=https://<dominio-de-tu-api>
```

Sin ella, en desarrollo usa la IP de la máquina que sirve el paquete, que es lo
que interesa mientras se programa. Para una versión distribuible hay que
fijarla.

## Repasar antes de publicar

- [ ] `VITE_API_URL` definida en Pages y apuntando a la API real
- [ ] `CORS_ORIGINS` en la API incluye `https://adivimat.disvimat.net`
- [ ] La IP de la API autorizada en Atlas
- [ ] El temario cargado en la base de datos de producción
- [ ] El primer administrador creado desde `/register`
- [ ] Comprobado que recargar `/gestion` no devuelve un 404
- [ ] `ADMIN_CODE` cambiado respecto al de desarrollo

\pagebreak
