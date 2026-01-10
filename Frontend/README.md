# Frontend - Sistema SaaS Taller

Este es el frontend del sistema, construido con **React**, **TypeScript**, **Vite** y **TailwindCSS**.

## 📋 Requisitos Previos

- **Node.js** (v18 o superior)
- El **Backend** debe estar corriendo en el puerto 3000.

## 🚀 Configuración del Proyecto

### 1. Variables de Entorno
Crea un archivo `.env` en la carpeta `Frontend/` basándote en el ejemplo.
**Nota:** Vite requiere que las variables empiecen con `VITE_`.

\`\`\`bash
cp .env.example .env
\`\`\`

Contenido de `.env`:
\`\`\`env
VITE_API_URL=http://localhost:3000
\`\`\`

### 2. Instalar Dependencias
Entra a la carpeta del frontend e instala los paquetes:
\`\`\`bash
cd Frontend
npm install
\`\`\`

## ▶️ Ejecutar en Desarrollo

Para iniciar la aplicación en modo desarrollo:
\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en \`http://localhost:5173\`.

## 📦 Construir para Producción

Para generar los archivos estáticos optimizados:
\`\`\`bash
npm run build
\`\`\`
Los archivos se generarán en la carpeta \`dist/\`.

## 🧩 Estructura Clave

- \`src/api\`: Configuración de Axios.
- \`src/services\`: Lógica de llamadas al backend (ej. \`userService.ts\`).
- \`src/pages\`: Vistas principales (ej. \`UsersPage.tsx\`).
- \`src/components\`: Componentes reutilizables (Modales, Formularios).
