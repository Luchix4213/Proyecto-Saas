import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Iniciando limpieza de la base de datos...');

    // Orden de eliminación para respetar restricciones de clave foránea
    // 1. Tablas dependientes (Detalles, Imágenes, Notificaciones, etc.)
    await prisma.detalleVenta.deleteMany();
    await prisma.detalleCompra.deleteMany();
    await prisma.productoImagen.deleteMany();
    await prisma.notificacion.deleteMany();

    // 2. Tablas transaccionales (Ventas, Compras, Suscripciones)
    await prisma.venta.deleteMany();
    await prisma.compra.deleteMany();
    await prisma.suscripcion.deleteMany();

    // 3. Tablas principales de entidad (Productos)
    await prisma.producto.deleteMany();

    // 4. Tablas de soporte (Categorias, Proveedores, Clientes, Usuarios)
    await prisma.categoria.deleteMany();
    await prisma.proveedor.deleteMany();
    await prisma.cliente.deleteMany();
    await prisma.usuario.deleteMany();

    // 5. Tablas base (Tenant)
    await prisma.tenant.deleteMany();

    // 6. Catálogos globales (Plan, Rubro)
    // Nota: Si Rubros o Planes son constantes, quizás no deberíamos borrarlos, pero el usuario dijo "limpialo todo".
    // seed2.ts los vuelve a crear con upsert.
    await prisma.plan.deleteMany();
    await prisma.rubro.deleteMany();

    console.log('Base de datos limpiada exitosamente. Tablas conservadas.');
}

main()
    .catch((e) => {
        console.error('Error durante la limpieza:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
