# Taller de Proyectos (INF281, INF 266) - Verano 2025

## Proyecto #1: SaaS (Software as a Service)

### Sistema de inventarios y ventas para microempresas

#### Objetivo

Desarrollar un sistema SaaS de ventas e inventarios, accesible desde web y aplicación móvil, que permita a microempresas gestionar de manera eficiente sus productos, stock, ventas y reportes, optimizando sus procesos operativos y apoyando la toma de decisiones, mediante una plataforma segura y de fácil uso.

---

## MÓDULOS DEL SISTEMA SaaS

### 1. Módulo de Gestión de Usuarios

**Objetivo:** Administrar los usuarios internos de cada microempresa.

- **Funcionalidades:**
  - [x] Crear usuarios (administrador (Admin del SaaS), propietario (Propietario de la microempresa), vendedor)
  - [x] Asignación de roles y permisos
  - [x] Hash de contraseña
  - [x] Edición y eliminación de usuarios
  - [x] Activación / desactivación de usuarios
  - [x] Cambio de contraseña

### 2. Módulo de Autenticación y Suscripción

**Objetivo:** Gestionar clientes, planes y acceso al sistema.

- **Funcionalidades:**
  - [x] Registro de microempresa (tiendas pequeñas o tenant)
  - [x] Inicio de sesión (Administradores, Propietarios, Vendedores)
  - [x] Autenticación de Clientes Finales (Registro y Login en Storefront)
  - [x] Recuperación de contraseña (Lógica implementada)
  - [x] Gestión de planes (Básico / Premium / FREE)
  - [x] Activación / desactivación de empresa

### 3. Módulo de Gestión de la Microempresa

**Objetivo:** Administrar la información general y configuración de cada microempresa registrada en el sistema.

- **Funcionalidades:**
  - [x] Registro y edición de datos de la empresa
  - [x] Configuración de moneda e impuestos
  - [x] Carga de logotipo y Banner
  - [x] Definición de horarios de atención (UI funcional)
  - [x] Estado de la empresa (activa/inactiva)

### 4. Módulo de Gestión de Catálogo y Marketplace

**Objetivo:** Gestionar el ciclo de vida de los productos y su exposición pública tanto en portales individuales como en un marketplace centralizado.

- **Funcionalidades:**
  - [x] **Gestión Interna (Dashboard):** Registro, categorización, control de precios y (des)activación de productos por parte de la microempresa.
  - [x] **Portal de Productos (Storefront):** Cada empresa cuenta con su propia URL pública/catálogo para clientes finales.
  - [x] **Landing Page & Marketplace (SaaS Home):** Portal principal tipo Amazon que permite buscar productos de todas las microempresas registradas.
  - [x] **Notificaciones y Alertas:**
    - [x] Centro de notificaciones interno para eventos clave (Stock bajo, nuevas ventas).
    - [ ] Envío de correos automáticos (Pendiente integración SMTP).

### 5. Módulo de Gestión de Clientes

**Objetivo:** Gestionar la información de los clientes finales.

- **Funcionalidades:**
  - [x] Registro de clientes
  - [x] Edición y eliminación de clientes
  - [x] Búsqueda de clientes
  - [x] Historial de compras (UI Placeholder)
  - [x] Cliente genérico (venta rápida)

### 6. Módulo de Proveedores

**Funciones:**

- [x] Registro de proveedores (Modelo en BD)
- [x] Historial de compras (Vinculado a ingresos de mercadería)
- [x] Datos de pago
- [x] Productos que suministran
- [x] Activación / desactivación de proveedores

### 7. Módulo de Inventario (Stock)

**Objetivo:** Controlar las existencias de productos.

- **Funcionalidades:**
  - [x] Registro de stock inicial
  - [x] Actualización de stock por ventas (Automático en POS)
  - [x] Ajustes manuales de inventario
  - [x] Alerta de stock mínimo (Visual en dashboard)
  - [x] Consulta de disponibilidad

### 8. Módulo de Ventas Online

**Objetivo:** Registrar y gestionar las ventas realizadas.

- **Funcionalidades:**
  - [x] Registro de ventas (POS)
  - [x] Selección de productos y cantidades
  - [x] Cálculo automático del total
  - [x] Descuento de stock automático
  - [x] Historial de ventas (Vista de Ventas Online completa)
  - [x] Cliente elige sus productos e incluye en su carrito (Persistencia local)
  - [x] Checkout Híbrido (Invitado / Registrado)
  - [x] Pagar mediante un QR (Simulación / Instrucciones)
  - [ ] Enviar un comprobante (documento PDF de venta)
  - [x] El administrador valida entrega de producto al cliente (Gestión de estados)

### 9. Módulo de Reportes

**Funciones:**

- [x] Reportes de ventas (Dashboard Real)
- [x] Reportes de inventario
- [x] Reportes financieros (Estimaciones)
- [x] Gráficos y estadísticas (KPI Cards y Gráficos)

### 10. Módulo de Compras

**Objetivo:** Gestionar las compras realizadas a proveedores.

- **Funcionalidades:**
  - [x] Registro de compras (Ingreso mercadería)
  - [x] Asociación a proveedores
  - [x] Actualización automática del inventario
  - [x] Control de gastos (Registro de costo unitario)
  - [x] Historial de compras (Vista completa con descarga de PDF)

---

## Arquitectura Recomendada (Visión SaaS)

### Estructura de Navegación (3 Niveles)

1.  **Landing Page / Marketplace:** (`/`) Pública. Venta del SaaS y buscador global de productos.
2.  **Storefronts:** (`/tienda/[slug]`) Pública. Catálogo específico de cada microempresa.
3.  **Dashboard Administrativo:** (`/admin`) Privada. Gestión interna de cada tenant.

### Frontend

- **Web:** React + TypeScript + Tailwind
- **Móvil:** Flutter

### Backend

- **API:** REST o GraphQL
- **Tecnologías:** NestJS + Prisma
- **Autenticación:** JWT / OAuth

### Base de Datos

- **Motor:** PostgreSQL
- **Diseño Multitenant:**
  - `tenant_id` por cliente (Shared Database, Shared Schema)

### Infraestructura

- **Contenerización:** Docker

---

## PRÓXIMAS MEJORAS Y ROADMAP

### A corto plazo (Refinamiento)

- **Logística de Entrega**: Integración de link de Google Maps o coordenadas en pedidos online.
- **Historial Unificado de Ventas**: Creación de una vista consolidada para que el propietario pueda filtrar y buscar tanto ventas físicas (POS) como online en un solo lugar.
- **Inteligencia de Precios**: Visualización clara del costo vs precio de venta para calcular márgenes de ganancia.
- **Validaciones Robustas**: Validación de NIT/CI por país y restricción de stock negativo a nivel de Base de Datos.
- **Seguridad y Auditoría**:
  - Implementación de Autenticación en Dos Pasos (2FA) para acceso administrativo.
  - Sistema de Logs/Auditoría: Registro detallado de "Quién hizo qué" (creación, edición, eliminación de productos, descuentos manuales, etc.).

### A mediano plazo (Escalabilidad)

- **Historial de Movimientos**: Registro de auditoría para cada entrada/salida de stock.
- **PWA (Progressive Web App)**: Permitir la instalación del dashboard como aplicación en móviles.
- **Soporte de Impresión**: Integración con impresoras térmicas para emisión de recibos físicos.
