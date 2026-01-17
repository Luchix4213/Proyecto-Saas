# Guía de Gestión de Clientes Multi-tenant

Este documento explica cómo el proyecto resuelve los requisitos técnicos solicitados sobre la gestión de clientes en un entorno SaaS.

### 1. Registrar al cliente con datos abc y 111 (Manejo del `id_tenant`)

El registro se realiza a través del método `create` en el servicio de clientes. El `id_tenant` se extrae automáticamente del token del usuario autenticado para asegurar el aislamiento de datos.

- **Controlador**: `backend/src/modules/clientes/clientes.controller.ts` (Línea 21)
- **Servicio**: `backend/src/modules/clientes/clientes.service.ts` (Línea 11)
- **Código Clave**:

```typescript
// En ClientesController
const tenantId = this.getTenantId(req); // Extrae id_tenant del user en la request
return this.clientesService.create(createClienteDto, tenantId);

// En ClientesService
async create(createClienteDto: CreateClienteDto, tenantId: number) {
    return this.prisma.cliente.create({
        data: {
            ...createClienteDto,
            tenant_id: tenantId, // El id_tenant se inyecta aquí
        },
    });
}
```

### 2. Modificar los datos del cliente

La modificación se maneja mediante el método `update`, el cual primero verifica que el cliente pertenezca al `tenant_id` del usuario que realiza la petición.

- **Controlador**: `backend/src/modules/clientes/clientes.controller.ts` (Línea 38)
- **Servicio**: `backend/src/modules/clientes/clientes.service.ts` (Línea 46)

### 3. Buscar a todos los clientes de una microempresa

El sistema utiliza el `tenant_id` como Filtro Global (FK en Cliente). Para listar los clientes de la microempresa actual (`sistoys`), se utiliza el método `findAll` filtrando por el tenant autenticado.

- **Servicio**: `backend/src/modules/clientes/clientes.service.ts` (Línea 24)
- **Código Clave**:

```typescript
async findAll(tenantId: number) {
    return this.prisma.cliente.findMany({
        where: {
            tenant_id: tenantId, // Filtra solo los clientes de esta microempresa
            estado: EstadoGenerico.ACTIVO
        }
    });
}
```

### 4. Eliminar al cliente creado

La eliminación en este proyecto es **Lógica (Soft Delete)**. En lugar de borrar el registro de la DB, se cambia su estado a `INACTIVO`.

- **Controlador**: `backend/src/modules/clientes/clientes.controller.ts` (Línea 44)
- **Servicio**: `backend/src/modules/clientes/clientes.service.ts` (Línea 55)

### 5. Mostrar a los eliminados

Para ver los clientes eliminados (inactivos), se debe consultar el campo `estado` en la tabla `Cliente`. El servicio `findAll` actualmente filtra por `ACTIVO` por defecto, pero se puede consultar el estado `INACTIVO` mediante una consulta adicional al modelo de Prisma.

- **Modelo Prisma**: `backend/prisma/schema.prisma` (Líneas 167-184)
- **Atributo**: `estado` de tipo `EstadoGenerico` (Valores: `ACTIVO`, `INACTIVO`).
