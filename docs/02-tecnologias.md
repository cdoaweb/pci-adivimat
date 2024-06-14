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
- **[Expicado aqí](03-docker.md)**

## Front-end:
### React.js
- **Qué es**: React.js es una biblioteca de JavaScript para construir interfaces de usuario.
- **Por qué lo uso**: React.js permite la creación de aplicaciones web dinámicas y rápidas gracias a su enfoque basado en componentes y su eficiente manejo del DOM virtual.

### Redux
- **Qué es**: Redux es una biblioteca para el manejo del estado de la aplicación.
- **Por qué lo uso**: Facilita la gestión del estado en aplicaciones React, permitiendo un flujo de datos predecible y simplificado a través de un almacén centralizado.

### React Router
- **Qué es**: React Router es una biblioteca para manejar la navegación y las rutas en aplicaciones React.
- **Por qué lo uso**: Permite definir rutas y gestionar la navegación de manera sencilla y eficiente, mejorando la experiencia de usuario en aplicaciones de una sola página (SPA).

### Axios
- **Qué es**: Axios es una biblioteca para hacer solicitudes HTTP desde el navegador.
- **Por qué lo uso**: Facilita la comunicación con el backend, permitiendo realizar peticiones API de manera sencilla y con soporte para promesas.

### aria-live
- **Qué es**: `aria-live` es un atributo de accesibilidad utilizado para anunciar dinámicamente las actualizaciones de contenido a los usuarios de tecnologías asistivas, como lectores de pantalla.
- **Por qué lo uso**: Utilizo `aria-live` para asegurar que los mensajes importantes y las actualizaciones en la aplicación sean accesibles para todos los usuarios, incluyendo aquellos con discapacidades visuales. Esto mejora la usabilidad y accesibilidad de la aplicación, garantizando que todos los usuarios reciban la información crítica de manera oportuna.

## Estructura

### 1. `App.js`
- Configuración principal de la aplicación, incluyendo rutas y componentes básicos.
- **Tecnologías usadas**: React.js, React Router.

### 2. Rutas
- **`About.js`**: Página de información sobre la aplicación.
- **`AddRiddle.js`**: Página para añadir nuevas adivinanzas.
- **`AddSubtheme.js`**: Página para añadir nuevos subtemas.
- **`AddTheme.js`**: Página para añadir nuevos temas.
- **`EditTheme.js`**: Página para editar temas existentes.
- **`EditSubtheme.js`**: Página para editar subtemas existentes.
- **`EditRiddle.js`**: Página para editar adivinanzas existentes.
- **`Home.js`**: Página principal de la aplicación.
- **`Login.js`**: Página de inicio de sesión.
- **`Register.js`**: Página de registro de usuarios administradores.
- **`Gestion.js`**: Página para la gestión de temas, subtemas y adivinanzas.
- **Tecnologías usadas**: React.js, React Router.

### 3. Controladores de Estado
- **`AuthProvider.js`**: Controla la lógica de autenticación y el estado del usuario.
- **`ThemeContext.js`**: Controla la lógica de temas y subtemas.
- **Tecnologías usadas**: React.js, Redux.

### 4. Configuración
- **`axiosConfig.js`**: Configuración de Axios para manejar solicitudes HTTP.
- **`validation.js`**: Funciones de validación para entradas de usuario.
- **Tecnologías usadas**: Axios, JavaScript.

### 5. Componentes de Interfaz
- **`Footer.js`**: Componente para el pie de página de la aplicación.
- **`MenuAppBar.js`**: Barra de navegación superior.
- **`LogoutButton.js`**: Botón para cerrar sesión.
- **`PrivateRoute.js`**: Componente para proteger rutas privadas.
- **`RiddleSelector.js`**: Selector de adivinanzas.
- **`RiddleTable.js`**: Tabla de adivinanzas.
- **`ThemeList.js`**: Lista de temas.
- **`SubthemeList.js`**: Lista de subtemas.
- **`ThemeManager.js`**: Gestión de temas y subtemas.
- **Tecnologías usadas**: React.js, CSS.

### 6. Estilos
- **`App.css`**: Define los estilos globales de la aplicación.
- **`Footer.css`**: Define los estilos específicos para el pie de página.
- **Tecnologías usadas**: CSS.

### 7. Gestión de Contenidos
- **`ThemeManager.js`**: Componente principal para la gestión de temas, subtemas y adivinanzas.
  - **Qué es**: Proporciona la interfaz para gestionar los temas, subtemas y adivinanzas.
  - **Por qué lo uso**: Permite a los administradores añadir, editar y eliminar contenido de manera eficiente.

### 8. Autenticación y Autorización
- **`Login.js`**: Página de inicio de sesión.
  - **Qué es**: Permite a los usuarios autenticarse en la aplicación.
  - **Por qué lo uso**: Controla el acceso a las funcionalidades protegidas de la aplicación.

- **`Register.js`**: Página de registro de usuarios.
  - **Qué es**: Permite a los nuevos usuarios administradores registrarse en la aplicación.
  - **Por qué lo uso**: Facilita la incorporación de nuevos admin a la aplicación.

- **`LogoutButton.js`**: Botón para cerrar sesión.
  - **Qué es**: Permite a los usuarios cerrar su sesión de manera segura.
  - **Por qué lo uso**: Garantiza que los usuarios puedan cerrar sesión y proteger su información.

- **`PrivateRoute.js`**: Componente para proteger rutas privadas.
  - **Qué es**: Protege rutas que solo deben ser accesibles para usuarios autenticados.
  - **Por qué lo uso**: Asegura que solo los usuarios autenticados puedan acceder a ciertas funcionalidades.

  ### Despliegue del frontend
**[React](04-react.md)**

\pagebreak