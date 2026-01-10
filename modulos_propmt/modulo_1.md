# Plan de Implementación: Módulo 1 - Gestión de Usuarios

Este módulo se encarga de la administración de los usuarios internos de cada microempresa (Tenant). Garantiza que cada empresa pueda gestionar su propio personal con roles y permisos específicos.

## 🛠️ Backend (NestJS + Prisma)

### 1. Infraestructura Base

- [ ] **Crear `PrismaService`**: Servicio global para interactuar con la base de datos.
- [ ] **Crear `AuthGuard` y `RolesGuard`**: Para proteger los endpoints y validar roles (`ADMIN`, `PROPIETARIO`, `VENDEDOR`).
- [ ] **Crear `TenantInterceptor`**: Asegurar que todas las consultas a usuarios estén filtradas automáticamente por el `tenant_id` del usuario autenticado.

### 2. Módulo de Usuarios (`src/modules/usuarios`)

- [ ] **Definir DTOs**:
  - `CreateUserDto`: Validación para creación (email, password, nombre, rol).
  - `UpdateUserDto`: Validación para edición (nombre, paterno, materno, estado).
  - `ChangePasswordDto`: Validación para cambio de contraseña.
- [ ] **Implementar `UsuariosService`**:
  - `create`: Hashear contraseña con bcrypt y guardar.
  - `findAll`: Listar usuarios filtrados por `tenant_id`.
  - `findOne`: Obtener detalle de un usuario.
  - `update`: Modificar datos y activar/desactivar.
  - `changePassword`: Validar contraseña antigua y hashear la nueva.
- [ ] **Implementar `UsuariosController`**:
  - `POST /usuarios`: Solo `ADMIN` o `PROPIETARIO`.
  - `GET /usuarios`: Listar personal.
  - `PATCH /usuarios/:id`: Editar usuario.
  - `PATCH /usuarios/:id/estado`: Activar/desactivar.
  - `POST /usuarios/password`: Cambio de contraseña personal.

---

## 💻 Frontend (React + TypeScript + Tailwind)

### 1. Servicios y Tipos

- [ ] **Definir Interfaces**: `User`, `CreateUserRequest`, `UpdateUserRequest` en `src/types`.
- [ ] **Crear `userService.ts`**: Funciones para llamar a los endpoints del backend usando Axios.

### 2. Componentes de UI

- [ ] **Vista de Listado de Usuarios**:
  - Tabla con columnas: Nombre, Email, Rol, Estado.
  - Badge de colores para Roles (`ADMIN`: Rojo, `PROPIETARIO`: Azul, `VENDEDOR`: Verde).
- [ ] **Formulario de Creación/Edición**:
  - Modal o página con validaciones usando `react-hook-form` y `zod`.
  - Selector de Roles.
- [ ] **Acciones Administrativas**:
  - Botón de Activar/Desactivar con confirmación.
  - Modal para Cambio de Contraseña de terceros (solo Admin/Propietario).

### 3. Integración y Rutas

- [ ] **Configurar Rutas**: Añadir `/usuarios` en el router principal protegida por el layout de administración.
- [ ] **Control de Acceso**: Ocultar botones de "Nuevo Usuario" si el usuario logueado es rol `VENDEDOR`.

---

## 🧪 Verificación

- [ ] **Pruebas de Backend**:
  - Intentar crear un usuario en el Tenant A usando el token del Tenant B (Debe fallar).
  - Verificar que el password_hash se guarde correctamente y no sea texto plano.
- [ ] **Pruebas de Frontend**:
  - Verificar que el listado se actualice tras crear o editar un usuario.
  - Probar el toggle de activación/desactivación de cuenta.
