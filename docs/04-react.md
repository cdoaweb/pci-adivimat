# React 

## Requisitos Previos

Para trabajar en el proyecto en React, necesitamos el siguiente software:

1. **Node.js**: Necesario para el proceso de transpilación, empaquetado, lint, etc. Puedes descargarlo e instalarlo desde [nodejs.org](https://nodejs.org/).

2. **npm (Node Package Manager)**: Viene incluido con la instalación de Node.js y se usa para gestionar las dependencias del proyecto.

## Instalación del Proyecto

Sigue estos pasos para configurar el entorno de desarrollo y ejecutar el proyecto React.

### Paso 1: Clonar el Repositorio

```Git
git clone <https://github.com/cdoaweb/pci-adivimat.git>
cd pci-adivimat/frontend/adivimat-accesible
```

### Paso 2: Instalar Dependencias
Instala las dependencias necesarias ejecutando el siguiente comando en el directorio del proyecto. Las dependencias necesarias están listadas en el archivo `package.json.

```bash
npm install
```

### Dependencias en `package.json`
Estas son las dependencias que se instalarán:
```json
"dependencies": {
  "@emotion/react": "^11.11.4",
  "@emotion/styled": "^11.11.5",
  "@mui/material": "^5.15.18",
  "@testing-library/jest-dom": "^5.17.0",
  "@testing-library/react": "^13.4.0",
  "@testing-library/user-event": "^13.5.0",
  "axios": "^1.6.8",
  "dotenv": "^16.4.5",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.23.1",
  "react-scripts": "5.0.1",
  "web-vitals": "^2.1.4"
}
```

### Paso 3: Ejecutar la Aplicación
Para iniciar la aplicación en modo desarrollo, usa el siguiente comando:
```bash
npm start
```

Esto abrirá una nueva pestaña en el navegador con la aplicación React en funcionamiento.

\pagebreak