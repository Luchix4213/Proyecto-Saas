# Plan de Implementación: Módulo 2 - Autenticación y Suscripción

Este módulo es la puerta de entrada al sistema SaaS. Gestiona el registro de nuevos Tenants (microempresas), la asignación de planes (Freemium/Básico/Premium) y el acceso seguro de los usuarios.

## 🛠️ Backend (NestJS + Prisma)

### 1. Configuración de Seguridad

- [x] **Configurar `JwtModule`**: Definir secreto, tiempo de expiración y estrategia de firma. (Implementado en `AutenticacionModule`).
- [x] **Implementar `JwtStrategy`**: Para validar tokens en cada petición. (Implementado).
- [x] **Implementar `BcryptService`**: Para el hashing seguro de contraseñas. (Usado directamente `bcrypt` en Servicios).

### 2. Módulo de Autenticación (`src/modules/autenticacion`)

- [x] **Registro de Microempresa (`POST /auth/register`)**:
  - Implementar transacción en Prisma para:
    1. Validar disponibilidad de email.
    2. Crear el `Tenant` con un plan por defecto (`FREE` o `BASICO`).
    3. Crear el primer `Usuario` con rol `PROPIETARIO` vinculado al nuevo Tenant.
- [x] **Inicio de Sesión (`POST /auth/login`)**:
  - Validar credenciales.
  - Verificar que tanto el `Tenant` como el `Usuario` estén en estado `ACTIVO`.
  - Retornar JWT con `usuario_id`, `tenant_id` y `rol`.
- [x] **Recuperación de Contraseña**:
  - Implementar lógica de generación de tokens temporales (Mock de envío de correos por ahora).

### 3. Módulo de Microempresas/Planes (`src/modules/microempresas`)

- [x] **Gestión de Planes**:
  - `PATCH /tenants/plan`: Cambiar el plan de la empresa (Upgrade/Downgrade). (Nota: Implementado en `TenantsModule`)
- [x] **Estado de la Empresa**:
  - `PATCH /tenants/estado`: Activar o desactivar el acceso total al tenant (Solo visible para Admin SaaS). (Nota: Implementado en `TenantsModule`)

---

## 💻 Frontend (React + TypeScript + Tailwind)

### 1. Gestión de Estado y sesión

- [x] **`AuthContext.tsx`**:
  - Manejo de token en `localStorage`.
  - Funciones `login()`, `logout()` y `refreshSession()`.
  - Persistencia del estado del usuario.

### 2. Vistas de Autenticación

- [x] **Página de Login**:
  - Formulario con validaciones.
  - Manejo de errores (Credenciales inválidas, Empresa inactiva).
- [x] **Página de Registro (Onboarding)**:
  - Formulario dividido en secciones: "Datos de la Empresa" y "Datos del Administrador".
  - Selección de plan inicial.
- [x] **Recuperación de Contraseña**:
  - Formulario de "Olvidé mi contraseña" y "Restablecer contraseña".

### 3. Configuración de Suscripción

- [x] **Panel de Configuración de Cuenta**:
  - Mostrar plan actual y sus límites.
  - Botón para solicitar cambio de plan.

---

## 🧪 Verificación

- [x] **Pruebas de Registro**:
  - Validar que no se puedan registrar dos empresas con el mismo email.
- [x] **Pruebas de Acceso**:
  - Desactivar una empresa desde la BD y verificar que ningún usuario de esa empresa pueda loguearse.
- [x] **Pruebas de Seguridad**:
  - Verificar que el JWT contenga la información necesaria para el multi-tenancy.

### 4. Administración SaaS (Nuevo)

- [x] **Aprobación de Tenants**:
  - Flujo de registro con estado `PENDIENTE`.
  - Página de administración para aprobar/rechazar tenants.
- [x] **Restricciones de Roles**:
  - Propietarios limitados a crear solo Vendedores.
