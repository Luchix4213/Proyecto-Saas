# Sistema SaaS de Inventarios y Ventas para Microempresas

Este repositorio contiene el código fuente de un sistema SaaS diseñado para gestionar inventarios y ventas.

## 🏗 Estructura del Proyecto

El proyecto es un monorepo dividido en dos carpetas principales:

-   **`Frontend/`**: Aplicación web construida con **React**, **Vite** y **Tailwind CSS**.
-   **`backend/`**: Servidor API construido con **NestJS**, **Prisma ORM** y **PostgreSQL**.

---

## 🚀 Guía de Instalación para Colaboradores

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina local.

### 1. Requisitos Previos

*   **Node.js**: Versión 20 o superior.
*   **PostgreSQL**: Base de datos instalada y corriendo.
*   **Git**: Para clonar el repositorio.

### 2. Configuración del Backend

1.  Navega a la carpeta del backend:
    ```bash
    cd backend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  **Configurar Base de Datos (IMPORTANTE):**
    Este proyecto usa **Prisma 7**. La configuración de la conexión se encuentra en el archivo `backend/prisma.config.ts`.

    *   Abre `backend/prisma.config.ts`.
    *   Edita la propiedad `url` dentro de `datasource` con tus credenciales de PostgreSQL:
        ```typescript
        // Ejemplo:
        url: "postgresql://usuario:contraseña@localhost:5432/nombre_bd"
        ```
    *   *Nota: Si tu usuario tiene contraseña, asegúrate de ponerla correctamente.*

4.  Generar el Cliente de Prisma y Sincronizar BD:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  Iniciar el servidor de desarrollo:
    ```bash
    npm run start:dev
    ```
    El servidor correrá en: `http://localhost:3000`

### 3. Configuración del Frontend

1.  Navega a la carpeta del frontend:
    ```bash
    cd Frontend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Iniciar el servidor de desarrollo:
    ```bash
    npm run dev
    ```
    La aplicación correrá en: `http://localhost:5173`

---

## 🛠 Comandos Útiles

| Comando | Carpeta | Descripción |
| :--- | :--- | :--- |
| `npm run start:dev` | `backend` | Inicia el servidor NestJS en modo watch. |
| `npx prisma studio` | `backend` | Abre una interfaz web para ver/editar la base de datos. |
| `npm run dev` | `Frontend` | Inicia el entorno de desarrollo de Vite. |
| `npm run build` | `Frontend` | Compila el proyecto React para producción. |

## 📦 Tecnologías

*   **Visualización**: Tailwind CSS v3 (configurado manualmente para estabilidad).
*   **Base de Datos**: PostgreSQL + Prisma 7.
*   **Validación**: ESLint + Prettier configurados globalmente.
