# Sistema SaaS de Inventarios y Ventas para Microempresas

Este repositorio contiene el código fuente de un sistema SaaS diseñado para gestionar inventarios y ventas.

## 🏗 Estructura del Proyecto

El proyecto está diseñado con una arquitectura modular y escalable, alineada con las mejores prácticas para React y NestJS.

### 🖥️ Frontend (React + TypeScript + Vite + Tailwind)

Estructura orientada a **Features** con una separación clara de UI y lógica.

```text
Frontend/
├── public/               # Assets estáticos públicos (favicon, logos globales)
├── src/
│   ├── assets/           # Recursos estáticos importables (imágenes, fuentes, svg)
│   ├── api/              # Capa de red (Axios) y definiciones de Endpoints
│   ├── components/       # Componentes Reutilizables
│   │   ├── ui/           # Design System (Botones, Inputs, Cards, Modales)
│   │   ├── shared/       # Componentes complejos compartidos (Tablas, Uploaders)
│   │   └── layout/       # Estructuras base (Sidebar, Navbar, Footer)
│   ├── config/           # Constantes globales y variables de entorno
│   ├── context/          # React Context (Theme, Auth, Toast)
│   ├── hooks/            # Hooks personalizados globales (useDebounce, useAuth)
│   ├── layouts/          # Layouts de rutas
│   │   ├── AuthLayout/   # Para Login/Registro (Sin sidebar)
│   │   └── MainLayout/   # Para la App principal (Con sidebar y header)
│   ├── modules/          # Módulos de Negocio (Vistas y lógica específica)
│   │   ├── auth/         # Login, Registro, Recuperación
│   │   ├── dashboard/    # Widgets y Resumen
│   │   ├── inventory/    # Gestión de Productos, Categorías y Ajustes
│   │   ├── pos/          # Punto de Venta (Carrito, Checkout, QR)
│   │   ├── sales/        # Historial y Detalles de Ventas
│   │   ├── purchases/    # Compras y Proveedores
│   │   ├── admin/        # Gestión de Usuarios y Tenants (SaaS)
│   │   ├── clients/      # Directorio de Clientes
│   │   └── reports/      # Gráficos y Exportación de datos
│   ├── router/           # Definición de rutas y Route Guards (Protección)
│   ├── store/            # Estado Global (Zustand/Redux) - Ej: Carrito de compras
│   ├── types/            # Interfaces y Tipos TypeScript globales
│   ├── utils/            # Funciones puras (Formateo moneda, fechas, validaciones)
│   ├── App.tsx           # Componente raíz
│   └── main.tsx          # Punto de entrada
```

### ⚙️ Backend (NestJS + Prisma + PostgreSQL)

Arquitectura modular con **Prisma 7** y validación estricta de entorno.

```text
backend/
├── prisma/               # Schema.prisma y migraciones
├── src/
│   ├── config/           # Configuración y validación de variables de entorno (.env)
│   ├── common/           # Código compartido transversal
│   │   ├── decorators/   # Decoradores custom (@CurrentUser, @Roles, @Public)
│   │   ├── dtos/         # DTOs genéricos (PaginationDto)
│   │   ├── filters/      # Manejo global de excepciones (HttpExceptionFilter)
│   │   ├── guards/       # Guards de seguridad (JwtAuthGuard, RolesGuard)
│   │   ├── interceptors/ # Transformación de respuestas
│   │   └── utils/        # Helpers (HashService, GeneratorService)
│   ├── modules/          # Módulos de Dominio (Feature Modules)
│   │   ├── autenticacion/ # Login, Registro, JWT Strategy
│   │   ├── usuarios/     # CRUD Usuarios (Admin, Vendedor)
│   │   ├── microempresas/ # Gestión de Tenants y Planes (SaaS Core)
│   │   ├── productos/    # Productos y Categorías
│   │   ├── inventario/   # Control de Stock, Kardex y Alertas
│   │   ├── ventas/       # Procesamiento de Ventas y Pagos
│   │   ├── compras/      # Gestión de Compras y Proveedores
│   │   ├── clientes/     # CRM Clientes
│   │   ├── notificaciones/ # Gateway de Email y Alertas Real-time
│   │   └── reportes/     # Agregación de datos y Estadísticas
│   ├── app.module.ts     # Módulo raíz (Importa todos los sub-módulos)
│   └── main.ts           # Configuración del servidor (Swagger, CORS, Pipes)
```

---

## 🚀 Guía de Instalación para Colaboradores

Sigue estos pasos para levantar el entorno de desarrollo.

### 1. Requisitos Previos

- **Node.js**: Versión 20 o superior.
- **PostgreSQL**: Base de datos instalada o vía Docker.

### 2. Configuración del Backend

1.  Navega a la carpeta del backend: `cd backend`
2.  Instala las dependencias: `npm install`
3.  **Configurar Variables de Entorno:**
    - Crea un archivo `.env` basado en `.env.example`.
    - Define tu URL de conexión:
      `DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nombre_bd?schema=public"`
4.  Generar el Cliente de Prisma y Sincronizar BD:
    ```bash
    npx prisma generate
    npx prisma db push
    ```
5.  Iniciar el servidor: `npm run start:dev` (Puero 3000)

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

| Comando             | Carpeta    | Descripción                                             |
| :------------------ | :--------- | :------------------------------------------------------ |
| `npm run start:dev` | `backend`  | Inicia el servidor NestJS en modo watch.                |
| `npx prisma studio` | `backend`  | Abre una interfaz web para ver/editar la base de datos. |
| `npm run dev`       | `Frontend` | Inicia el entorno de desarrollo de Vite.                |
| `npm run build`     | `Frontend` | Compila el proyecto React para producción.              |

## 📦 Tecnologías

- **Visualización**: Tailwind CSS v3 (configurado manualmente para estabilidad).
- **Base de Datos**: PostgreSQL + Prisma 7.
- **Validación**: ESLint + Prettier configurados globalmente.
