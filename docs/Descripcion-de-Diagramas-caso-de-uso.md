\pagebreak

# Descripción de Diagramas

## Backend

![Caso de uso backend](caso-de-uso-backend.png)

```plantuml
@startuml Caso de uso Backend

actor Usuario as U
actor Administrador as A

rectangle Sistema {
  (Registrarse) as registrarse
  (Iniciar Sesión) as iniciarSesion
  (Cerrar Sesión) as cerrarSesion
  (Ver Temas) as verTemas
  (Crear Tema) as crearTema
  (Actualizar Tema) as actualizarTema
  (Ver Subtemas) as verSubtemas
  (Crear Subtema) as crearSubtema
  (Actualizar Subtema) as actualizarSubtema
  (Eliminar Subtema) as eliminarSubtema
  (Ver Adivinanzas) as verAdivinanzas
  (Crear Adivinanza) as crearAdivinanza
  (Actualizar Adivinanza) as actualizarAdivinanza
  (Eliminar Adivinanza) as eliminarAdivinanza
  (Resolver Adivinanza) as resolverAdivinanza
  (Ver Mongo Express) as verMongoExpress
}

U --> verTemas : "Ver temas disponibles"
U --> verSubtemas : "Ver subtemas de un tema"
U --> verAdivinanzas : "Ver adivinanzas de un subtema"
U --> resolverAdivinanza : "Resolver adivinanza"

A --> registrarse : "Registro de usuario"
A --> iniciarSesion : "Inicio de sesión"
A --> cerrarSesion : "Cerrar sesión"
A --> crearTema : "Crear nuevo tema"
A --> actualizarTema : "Actualizar tema"
A --> crearSubtema : "Crear nuevo subtema"
A --> actualizarSubtema : "Actualizar subtema"
A --> eliminarSubtema : "Eliminar subtema"
A --> crearAdivinanza : "Crear nueva adivinanza"
A --> actualizarAdivinanza : "Actualizar adivinanza"
A --> eliminarAdivinanza : "Eliminar adivinanza"
A --> verMongoExpress : "Acceder a Mongo Express"

registrarse --> iniciarSesion : "Inicio de sesión tras registro"
iniciarSesion --> verTemas
verTemas --> verSubtemas
verSubtemas --> verAdivinanzas
verAdivinanzas --> resolverAdivinanza : "Resolver adivinanza"
resolverAdivinanza --> verAdivinanzas : "Volver a ver adivinanzas"
verAdivinanzas --> verTemas

crearTema --> verTemas
actualizarTema --> verTemas
crearSubtema --> verSubtemas
actualizarSubtema --> verSubtemas
eliminarSubtema --> verSubtemas
crearAdivinanza --> verAdivinanzas
actualizarAdivinanza --> verAdivinanzas
eliminarAdivinanza --> verAdivinanzas

@enduml

```


1. **Usuarios**:
   - **Usuario** puede:
     - Ver temas disponibles
     - Ver subtemas de un tema
     - Ver adivinanzas de un subtema
     - Resolver adivinanzas

2. **Administradores**:
   - **Administrador** puede:
     - Registrar un usuario
     - Iniciar sesión
     - Cerrar sesión
     - Crear, actualizar y eliminar temas, subtemas y adivinanzas
     - Acceder a Mongo Express

3. **Sistema**:
   - Gestiona las actividades de registro, inicio y cierre de sesión.
   - Permite la visualización, creación, actualización y eliminación de temas, subtemas y adivinanzas.
   - Facilita a los usuarios la visualización de temas, subtemas y adivinanzas, así como la resolución de estas últimas.

## Frontend

![Caso de uso frontend](caso-de-uso-frontend.png)

```plantuml
@startuml

actor Usuario as U
actor Administrador as A

rectangle Sistema {
  (Registrarse) as registrarse
  (Iniciar Sesión) as iniciarSesion
  (Cerrar Sesión) as cerrarSesion
  (Ver Temas) as verTemas
  (Crear Tema) as crearTema
  (Actualizar Tema) as actualizarTema
  (Ver Subtemas) as verSubtemas
  (Crear Subtema) as crearSubtema
  (Actualizar Subtema) as actualizarSubtema
  (Eliminar Subtema) as eliminarSubtema
  (Ver Adivinanzas) as verAdivinanzas
  (Crear Adivinanza) as crearAdivinanza
  (Actualizar Adivinanza) as actualizarAdivinanza
  (Eliminar Adivinanza) as eliminarAdivinanza
  (Resolver Adivinanza) as resolverAdivinanza
}

U --> verTemas : "Ver temas disponibles"
U --> verSubtemas : "Ver subtemas de un tema"
U --> verAdivinanzas : "Ver adivinanzas de un subtema"
U --> resolverAdivinanza : "Resolver adivinanza"

A --> registrarse : "Registro de usuario"
A --> iniciarSesion : "Inicio de sesión"
A --> cerrarSesion : "Cerrar sesión"
A --> crearTema : "Crear nuevo tema"
A --> actualizarTema : "Actualizar tema"
A --> crearSubtema : "Crear nuevo subtema"
A --> actualizarSubtema : "Actualizar subtema"
A --> eliminarSubtema : "Eliminar subtema"
A --> crearAdivinanza : "Crear nueva adivinanza"
A --> actualizarAdivinanza : "Actualizar adivinanza"
A --> eliminarAdivinanza : "Eliminar adivinanza"

registrarse --> iniciarSesion : "Inicio de sesión tras registro"
iniciarSesion --> verTemas
verTemas --> verSubtemas
verSubtemas --> verAdivinanzas
verAdivinanzas --> resolverAdivinanza : "Resolver adivinanza"
resolverAdivinanza --> verAdivinanzas : "Volver a ver adivinanzas"
verAdivinanzas --> verTemas

crearTema --> verTemas
actualizarTema --> verTemas
crearSubtema --> verSubtemas
actualizarSubtema --> verSubtemas
eliminarSubtema --> verSubtemas
crearAdivinanza --> verAdivinanzas
actualizarAdivinanza --> verAdivinanzas
eliminarAdivinanza --> verAdivinanzas

@enduml

```

### Actores
- **Usuario**: Interactúa con las funcionalidades de ver y resolver.
- **Administrador**: Tiene acceso completo a las funcionalidades de gestión y administración.

#### Funcionalidades
- **Registrarse**: Permite a un nuevo administrador registrarse en el sistema.
- **Iniciar Sesión**: Permite a los administradores autenticarse en el sistema.
- **Cerrar Sesión**: Permite a los administradores cerrar su sesión.
- **Ver Temas**: Permite ver la lista de temas disponibles.
- **Crear Tema**: Permite a los administradores crear un nuevo tema.
- **Actualizar Tema**: Permite a los administradores actualizar un tema existente.
- **Ver Subtemas**: Permite ver la lista de subtemas dentro de un tema.
- **Crear Subtema**: Permite a los administradores crear un nuevo subtema.
- **Actualizar Subtema**: Permite a los administradores actualizar un subtema existente.
- **Eliminar Subtema**: Permite a los administradores eliminar un subtema existente.
- **Ver Adivinanzas**: Permite ver la lista de adivinanzas dentro de un subtema.
- **Crear Adivinanza**: Permite a los administradores crear una nueva adivinanza.
- **Actualizar Adivinanza**: Permite a los administradores actualizar una adivinanza existente.
- **Eliminar Adivinanza**: Permite a los administradores eliminar una adivinanza existente.
- **Resolver Adivinanza**: Permite a los usuarios resolver una adivinanza específica.

\pagebreak