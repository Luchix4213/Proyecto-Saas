# Plan de Diseño y Desarrollo Mobile (Startup Grade)

Este plan detalla la reestructuración de la app de "Taller de Proyectos" hacia una plataforma multi-rol con estética de startup, utilizando **React Native Paper (Material Design 3)** y **NativeWind (Tailwind CSS)**.

## 🎨 Stack de UI & UX

- **Framework UI**: React Native Paper v5+ (Adaptative MD3).
- **Styling**: NativeWind v4 (Tailwind CSS classes).
- **Iconografía**: Lucide React Native.
- **Feedback**: Skeleton loaders y Micro-animaciones (Moti/Reanimated).

---

## 👥 Definición de Roles y Funcionalidades

### 1. Rol: VENDEDOR (Foco Operativo)

Diseño de "alto volumen" para facilitar la venta rápida en el local.

- **Home/Ventas**: Dashboard simple con "Ventas de Hoy" y botón gigante de "Nueva Venta".
- **POS / Punto de Venta**:
  - Escaneo de productos (cámara) o búsqueda por nombre.
  - Gestión de carrito con descuentos rápidos.
  - Checkout simplificado (Efectivo/QR).
- **Catálogo**: Consulta de stock en tiempo real y precios.
- **Clientes**: Registro y búsqueda de clientes para ventas nominativas.

### 2. Rol: PROPIETARIO (Foco en Gestión)

Diseño tipo "Control Room" para la microempresa.

- **Dashboard Principal**:
  - Gráficos: Ventas hoy vs histórico.
  - Alertas: Productos por agotarse, suscripción próxima a vencer.
- **Inventario Pro**:
  - CRUD de productos (Editar precios, nombres, categorías).
  - Listado de Proveedores y registro de compras para stock.
- **Ventas Totales**: Historial filtrable de todas las ventas del negocio.
- **Usuarios de Venta**: Ver cuánto ha vendido cada vendedor asignado.

### 3. Rol: ADMIN (Foco SaaS Global)

Interfaz de alto nivel para el administrador del ecosistema.

- **Dashboard Global**: Totales de empresas registradas, ingresos por planes.
- **Empresas (Tenants)**:
  - Listado maestro de negocios.
  - Activación/Suspensión manual de empresas.
- **Planes**: Gestión de límites de productos y ventas por tier.
- **Audit Logs**: Monitoreo de seguridad y actividad.

### 4. Rol: CONSUMIDOR (Tienda Online / Portal Público)

Interfaz pública para que los clientes finales compren online (e.g. `tienda.app/slug-negocio`).

- **Catálogo Público**: Navegación por categorías y productos con fotos grandes.
- **Carrito de Compras**: Gestión de pedidos.
- **Checkout Web**: Pasarela de pagos simplificada.
- **Tracking**: Estado del pedido (Recibido, En preparación, Listo).

---

## 🏗️ Requerimientos Técnicos de Navegación

Implementaremos un esquema de **Navegación Condicional**:

- `AuthStack`: Login y Recuperar Contraseña.
- `VendedorStack`: Bottom Tabs (Pos, Catalog, Clients, Profile).
- `OwnerStack`: Bottom Tabs (Dashboard, Inventory, Sales, More).
- `AdminStack`: Bottom Tabs (Tenants, Plans, AdminProfile).

---

## 🚀 Estado de Avance

### 🏗️ Infraestructura Core

- [x] **Instalación**: NativeWind v4 + Babel configurado.
- [x] **UI Framework**: React Native Paper Provider integrado en `App.tsx`.
- [x] **Navegación**: `AppNavigator.tsx` con Stacks condicionales por rol (`AdminStack`, `OwnerStack`, `VendorStack`).
- [x] **Tematización**: Sincronización de colores Paper/Tailwind y soporte para **Dark Mode**.
- [x] **API Client**: Axios configurado con interceptores y detección de IP local por entorno.

### 📱 Pantallas (v2 Startup Style)

- [x] **Login**: Rediseñado completamente con estética premium.
- [x] **Dashboards**: Estructuras base creadas para Vendedor, Propietario y Admin.
- [x] **Propietario (Owner)**:
  - [x] Home con métricas y alertas de stock (`OwnerDashboard.tsx`).
  - [x] Historial de ventas filtrable (`SalesScreen.tsx`).
  - [x] Listado de inventario premium (`InventoryScreen.tsx`).
  - [x] CRUD de Productos (Add/Edit) (`ProductFormScreen.tsx`).
  - [x] Gestión de Proveedores y Registro de Compras (`SuppliersScreen`, `PurchasesScreen`).
  - [x] Reportes de ventas por usuario/vendedor (`StaffReportScreen.tsx`).
  - [x] Gestión de Categorías (`CategoriesScreen.tsx`).
  - [x] Menú de configuración (`MoreScreen.tsx`).
  - [x] Configuración de Negocio (`BusinessSettingsScreen.tsx`).
  - [x] Configuración de Negocio (`BusinessSettingsScreen.tsx`).
  - [x] Mi Suscripción (`SubscriptionScreen.tsx`).
  - [x] Centro de Notificaciones (`NotificationsScreen.tsx`).

- [ ] **Vendedor (Vendor)**:
  - [x] Dashboard Operativo (`VendorDashboard.tsx`).
  - [x] **POS (Punto de Venta)**: Grid visual de productos, escáner QR/Barra, buscador rápido.
  - [ ] **Carrito de Compras**: Modificación de cantidades, descuentos manuales, selección de cliente.
  - [ ] **Checkout**: Selección de método de pago (Efectivo/QR/Fiado), cálculo de cambio, impresión de ticket.
  - [ ] **Clientes**: Búsqueda rápida y formulario de registro simplificado.
  - [ ] **Caja (Shift)**: Apertura y Cierre de turno, conteo de efectivo.
  - [ ] **Historial Local**: Ventas del día actual, reimpresión de tickets.

- [x] **Admin (SaaS Global)**:
  - [x] Dashboard Global métricas clave (`AdminDashboard.tsx`).
  - [x] **Tenants (Empresas)**: Listado con búsqueda global, detalle de empresa, switch de estado (Activo/Suspendido).
  - [x] **Planes**: CRUD de planes de suscripción (Precios, límites de productos/usuarios).
  - [x] **Usuarios Globales**: Búsqueda de usuarios para soporte.
  - [x] **Audit Log**: Visor de actividad crítica del sistema.

- [x] **Consumidor (Public Portal)**:
  - [x] **Home Tienda**: Listado de productos destacados y categorías (Storefront & Marketplace modes).
  - [x] **Detalle Producto**: Vista inmersiva con favoritos y carrito.
  - [x] **Carrito**: Resumen de orden y selección de entrega/retiro.
  - [x] **Checkout**: Integración de pagos QR, validación de NIT y subida de comprobantes.
  - [x] **Búsqueda (Search)**: Búsqueda global de tiendas y productos por categorías (Rubros).
  - [x] **Perfil (Profile)**: Gestión de dirección y datos de facturación (persistencia local).
  - [x] **Mis Pedidos**: Historial local de compras realizadas.
  - [x] **Favoritos**: Lista de deseos persistente en dispositivo.

---

## 🎯 Hoja de Ruta (Next Steps)

1.  **Refactor de Componentes**: Crear librerías de componentes reutilizables (`Card`, `Stat`, `Button`) que usen consistentemente el tema.
2.  **Módulo de Ventas (Vendedor)**: Implementar el flujo de POS/Nueva Venta con búsqueda de productos y carrito (Prioridad Alta).
3.  ✅ **Portal Público (E-commerce)**: Experiencia de compra completa implementada (Home, Search, Cart, Checkout, Profile).

---

> [!NOTE]
> Las pantallas actuales (`CatalogScreen`, `InventoryScreen`) están funcionando como fallback mientras terminamos la migración a `/screens/v2`.
