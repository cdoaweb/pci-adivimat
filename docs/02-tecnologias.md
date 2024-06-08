# Tecnologías

## Back-end:
### 1. **Node.js**
- **Qué es**: Node.js es un entorno de ejecución para JavaScript construido con el motor de JavaScript V8 de Chrome.
- **Por qué lo uso**: Node.js permite construir aplicaciones de red escalables y rápidas gracias a su modelo de E/S sin bloqueo y basado en eventos. Es ideal para aplicaciones en tiempo real y APIs RESTful.

### 2. **Express.js**
- **Qué es**: Express es un framework para aplicaciones web en Node.js.
- **Por qué lo uso**: Simplifica la creación y el manejo de rutas y middleware, permitiendo una configuración rápida y eficiente de la aplicación web y sus rutas.

### 3. **MongoDB**
- **Qué es**: MongoDB es una base de datos NoSQL orientada a documentos.
- **Por qué lo uso**: MongoDB proporciona una gran flexibilidad y escalabilidad, permitiendo almacenar datos en documentos JSON dinámicos. Es fácil de integrar con Node.js a través del driver de MongoDB para Node.js.

### 4. **Mongoose**
- **Qué es**: Mongoose es una biblioteca de Node.js que proporciona una solución basada en esquemas para modelar datos en MongoDB.
- **Por qué lo uso**: Simplifica las interacciones con MongoDB proporcionando validación de esquemas, casting de tipos y otras funcionalidades útiles.

### 5. **JWT (JSON Web Tokens)**
- **Qué es**: JWT es un estándar abierto para crear tokens de acceso que permiten la verificación y autorización de usuarios.
- **Por qué lo uso**: JWT es ideal para manejar la autenticación de usuarios en aplicaciones web y móviles, proporcionando una manera segura y compacta de transmitir información entre el cliente y el servidor.

### 6. **bcrypt**
- **Qué es**: bcrypt es una librería para el hashing de contraseñas.
- **Por qué lo uso**: Garantiza que las contraseñas de los usuarios estén almacenadas de manera segura mediante el uso de un algoritmo de hash que incluye un salt para mayor seguridad.

### 7. **dotenv**
- **Qué es**: dotenv es una librería que carga variables de entorno desde un archivo `.env` al `process.env` de Node.js.
- **Por qué lo uso**: Permite manejar de manera segura y sencilla las configuraciones sensibles y las credenciales de la aplicación.

### 8. **CORS (Cross-Origin Resource Sharing)**
- **Qué es**: CORS es un mecanismo que permite solicitudes HTTP desde diferentes dominios.
- **Por qué lo uso**: Necesito CORS para permitir que el frontend de la aplicación pueda comunicarse con el backend alojado en un dominio diferente, para mejoras en el futuro.

### 9. **Docker**
- **Qué es**: Docker es una plataforma para desarrollar, enviar y ejecutar aplicaciones dentro de contenedores.
- **Por qué lo uso**: Docker permite empaquetar la aplicación y sus dependencias en un contenedor, asegurando que funcione en cualquier entorno.  Esto facilita el despliegue y la escalabilidad de la aplicación.

## Estructura

### 1. `app.js`
- Configuración del servidor, conexión a la base de datos y establecimiento de las rutas principales de la aplicación.
- **Tecnologías usadas**: Express.js, Mongoose, dotenv, CORS.

### 2. Rutas
- **`authRoutes.js`**: Maneja las rutas de autenticación (`/register`, `/login`, `/logout`) y la verificación de administradores.
- **`temasRoutes.js`**: Maneja las rutas CRUD para `temas`, `subtemas` y `adivinanzas`.
- **Tecnologías usadas**: Express.js.

### 3. Controladores
- **`authController.js`**: Controla la lógica para el registro, inicio de sesión y verificación de usuarios.
- **`temaController.js`**: Controla la lógica CRUD para `temas`, `subtemas` y `adivinanzas`.
- **Tecnologías usadas**: Mongoose, bcrypt, JWT.

### 4. Modelos
- **`user.js`**: Define el esquema y modelo de `User`.
- **`tema.js`**: Define el esquema y modelo de `Tema`.
- **`subtema.js`**: Define el esquema y modelo de `Subtema`.
- **`adivinanza.js`**: Define el esquema y modelo de `Adivinanza`.
- **Tecnologías usadas**: Mongoose.

### 5. Utilidades
- **`generateToken.js`**: Función para generar tokens JWT.
- **Tecnologías usadas**: JWT.

### 6. Carpeta Stack con el docker-compose
- **Expicado en el archivo docker.md**

## Front-end:
- **React**: Opto por React para desarrollar una aplicación web responsive. Utilizo React debido a su eficiente manejo del DOM virtual y su capacidad para construir aplicaciones de página única con un rendimiento optimizado.
- **CSS-in-JS**: Utilizo CSS-in-JS porque me permite manejar estilos de una manera más modular y mantenible, integrando estilos dentro del propio JavaScript, lo que reduce la complejidad y mejora la cohesión del código.
- **Context API y Hooks**: La Context API junto con Hooks es la solución para el manejo del estado en React. Me decido por esta combinación debido a su simplicidad y eficacia, particularmente en aplicaciones de menor a mediana complejidad, donde la gestión de estado global con Redux sería excesiva.

## Despliegue y Mantenimiento:
- **Vercel**: Selecciono Vercel como la plataforma de despliegue debido a su afinidad con aplicaciones desarrolladas usando tecnologías basadas en JavaScript. Vercel nos ofrece despliegues automáticos desde repositorios Git, integración continua y optimización excepcional para aplicaciones de página única y aplicaciones móviles. Esto simplifica enormemente el proceso de despliegue y mantenimiento, permitiéndo concentrarme en el desarrollo y mejoras continuas.