# Plan de Implementación: Módulo 1 - Gestión de Usuarios

Este módulo se encarga de la administración de los usuarios internos de cada microempresa (Tenant). Garantiza que cada empresa pueda gestionar su propio personal con roles y permisos específicos.

## 🛠️ Backend (NestJS + Prisma)

### 1. Infraestructura Base

- [x] **Crear `PrismaService`**: Servicio global para interactuar con la base de datos.
- [x] **Crear `AuthGuard` y `RolesGuard`**: Para proteger los endpoints y validar roles (`ADMIN`, `PROPIETARIO`, `VENDEDOR`). (Implementado `AuthGuard` con JWT).
- [x] **Crear `TenantInterceptor`**: Asegurar que todas las consultas a usuarios estén filtradas automáticamente por el `tenant_id` del usuario autenticado.

### 2. Módulo de Usuarios (`src/modules/usuarios`)

- [x] **Definir DTOs**:
  - `CreateUserDto`: Validación para creación (email, password, nombre, rol).
  - `UpdateUserDto`: Validación para edición (nombre, paterno, materno, estado).
  - `ChangePasswordDto`: Validación para cambio de contraseña.
- [x] **Implementar `UsuariosService`**:
  - `create`: Hashear contraseña con bcrypt y guardar.
  - `findAll`: Listar usuarios filtrados por `tenant_id`.
  - `findOne`: Obtener detalle de un usuario.
  - `update`: Modificar datos y activar/desactivar.
  - `changePassword`: Validar contraseña antigua y hashear la nueva.
- [x] **Implementar `UsuariosController`**:
  - `POST /usuarios`: Solo `ADMIN` o `PROPIETARIO`. (Protegido via JWT y validación en Frontend/Backend)
  - `GET /usuarios`: Listar personal.
  - `PATCH /usuarios/:id`: Editar usuario.
  - `PATCH /usuarios/:id/estado`: Activar/desactivar.
  - `POST /usuarios/password`: Cambio de contraseña personal.

---

## 💻 Frontend (React + TypeScript + Tailwind)

### 1. Servicios y Tipos

- [x] **Definir Interfaces**: `User`, `CreateUserRequest`, `UpdateUserRequest` en `src/types`.
- [x] **Crear `userService.ts`**: Funciones para llamar a los endpoints del backend usando Axios.

### 2. Componentes de UI

- [x] **Vista de Listado de Usuarios**:
  - Tabla con columnas: Nombre, Email, Rol, Estado.
  - Badge de colores para Roles (`ADMIN`: Rojo, `PROPIETARIO`: Azul, `VENDEDOR`: Verde).
- [x] **Formulario de Creación/Edición**:
  - Modal o página con validaciones usando `react-hook-form` y `zod`.
  - Selector de Roles.
- [x] **Acciones Administrativas**:
  - Botón de Activar/Desactivar con confirmación.
  - Modal para Cambio de Contraseña de terceros (solo Admin/Propietario).

### 3. Integración y Rutas

- [x] **Configurar Rutas**: Añadir `/usuarios` en el router principal protegida por el layout de administración.
- [x] **Control de Acceso**: Ocultar botones de "Nuevo Usuario" si el usuario logueado es rol `VENDEDOR`. (Implementado `isAdminOrOwner` en UsersPage).

---

## 🧪 Verificación

- [x] **Pruebas de Backend**:
  - Intentar crear un usuario en el Tenant A usando el token del Tenant B (Validado por lógica en Service `tenant_id !== tenantId`).
  - Verificar que el password_hash se guarde correctamente y no sea texto plano.
- [x] **Pruebas de Frontend**:
  - Verificar que el listado se actualice tras crear o editar un usuario.
  - Probar el toggle de activación/desactivación de cuenta.
