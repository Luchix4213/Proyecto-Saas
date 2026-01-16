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
  - Crear usuarios (administrador (Admin del SaaS), propietario (Propietario de la microempresa), vendedor)
  - Asignación de roles y permisos
  - Hash de contraseña
  - Edición y eliminación de usuarios
  - Activación / desactivación de usuarios
  - Cambio de contraseña

### 2. Módulo de Autenticación y Suscripción

**Objetivo:** Gestionar clientes, planes y acceso al sistema.

- **Funcionalidades:**
  - Registro de microempresa (tiendas pequeñas o tenant)
  - Inicio de sesión
  - Recuperación de contraseña
  - Gestión de planes (Básico / Premium)
  - Activación / desactivación de empresa

### 3. Módulo de Gestión de la Microempresa

**Objetivo:** Administrar la información general y configuración de cada microempresa registrada en el sistema.

- **Funcionalidades:**
  - Registro y edición de datos de la empresa
  - Configuración de moneda e impuestos
  - Carga de logotipo
  - Definición de horarios de atención
  - Estado de la empresa (activa/inactiva)

### 4. Módulo de Gestión de Catálogo y Marketplace

**Objetivo:** Gestionar el ciclo de vida de los productos y su exposición pública tanto en portales individuales como en un marketplace centralizado.

- **Funcionalidades:**
  - **Gestión Interna (Dashboard):** Registro, categorización, control de precios y (des)activación de productos por parte de la microempresa.
  - **Portal de Productos (Storefront):** Cada empresa cuenta con su propia URL pública/catálogo para clientes finales.
  - **Landing Page & Marketplace (SaaS Home):** Portal principal tipo Amazon que permite buscar productos de todas las microempresas registradas.
  - **Notificaciones y Alertas:**
    - Envío de correos automáticos ante eventos clave (compras, stock bajo).
    - Notificaciones en tiempo real para el administrador y el cliente.

### 5. Módulo de Gestión de Clientes

**Objetivo:** Gestionar la información de los clientes finales.

- **Funcionalidades:**
  - Registro de clientes
  - Edición y eliminación de clientes
  - Búsqueda de clientes
  - Historial de compras
  - Cliente genérico (venta rápida)

### 6. Módulo de Proveedores

**Funciones:**

- Registro de proveedores
- Historial de compras
- Datos de pago
- Productos que suministran
- Activación / desactivación de productos

### 7. Módulo de Inventario (Stock)

**Objetivo:** Controlar las existencias de productos.

- **Funcionalidades:**
  - Registro de stock inicial
  - Actualización de stock por ventas
  - Ajustes manuales de inventario
  - Alerta de stock mínimo
  - Consulta de disponibilidad

### 8. Módulo de Ventas Online

**Objetivo:** Registrar y gestionar las ventas realizadas.

- **Funcionalidades:**
  - Registro de ventas
  - Selección de productos y cantidades
  - Cálculo automático del total
  - Descuento de stock automático
  - Historial de ventas
  - Cliente elige sus productos e incluye en su carrito
  - Pagar mediante un QR
  - Enviar un comprobante (documento PDF)
  - El administrador valida entrega de producto al cliente

### 9. Módulo de Reportes

**Funciones:**

- Reportes de ventas
- Reportes de inventario
- Reportes financieros
- Gráficos y estadísticas

### 10. Módulo de Compras

**Objetivo:** Gestionar las compras realizadas a proveedores.

- **Funcionalidades:**
  - Registro de compras
  - Asociación a proveedores
  - Actualización automática del inventario
  - Control de gastos
  - Historial de compras

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

## Datos de Ejemplo

### Microempresas

- **E1:** Juguetes Artesanales - 71512451
- **E2:** Zapatos artesanales

### Productos

| Empresa | ID  | Nombre                | Cantidad | Stock Min | Precio |
| ------- | --- | --------------------- | -------- | --------- | ------ |
| E1      | P1  | Autito Carreras Niños | 15       | 7         | 15 Bs  |
| E2      | P2  | Zapato de dama        | -        | -         | -      |
| E1      | P2  | Muñeca                | -        | -         | -      |

### Ventas

- **E1 - P1:** 5 unidades - 10 Bs (8/1/26)

### Compras o Ingresos

- **E1 - P1:** 10 unidades - 15 Bs (9/1/26)
