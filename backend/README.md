# Backend - Sistema SaaS Taller

Este es el backend del sistema, construido con **NestJS** y **Prisma** (con PostgreSQL).

## 📋 Requisitos Previos

- **Node.js** (v18 o superior)
- **PostgreSQL** instalado y corriendo.

## 🚀 Configuración del Proyecto

### 1. Clonar el repositorio

Asegúrate de estar en la raíz del proyecto.

### 2. Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/` basándote en el ejemplo:
```bash
cp .env.example .env
```

Edita el archivo `.env` y configura tu conexión a la base de datos:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/nombre_bd?schema=public"
```

### 3. Instalar Dependencias

Entra a la carpeta del backend e instala los paquetes:
```bash
cd backend
npm install
```

### 3.1. Configuración de Imágenes
El sistema guarda imágenes localmente en la carpeta `uploads`. Asegúrate de crearla:
```bash
mkdir -p uploads/tenants
```

### 4. Configurar Base de Datos (Prisma)

Genera el cliente de Prisma y sube los cambios a tu base de datos:
```bash

# Generar el cliente de Prisma

npx prisma migrate dev

# Sincronizar esquema con la BD (Entorno Desarrollo)

npx prisma db push

# (Opcional) Poblar base de datos con datos de prueba

npx ts-node prisma/seed.ts

# Resetear la base de datos

npx prisma generate && npm run db:reset
```

## ▶️ Ejecutar el Servidor

### Modo Desarrollo

```bash
npm run start:dev
```
El servidor correrá en `http://localhost:3000`.

### Endpoints Principales

- **Usuarios:** `/usuarios` (GET, POST, PUT, DELETE)

## 🛠️ Comandos Útiles

- **Ver BD con Prisma Studio:**
  ```bash
  npx prisma studio
  ```
- **Formatear código:**
  ```bash
  npm run format
  ```
