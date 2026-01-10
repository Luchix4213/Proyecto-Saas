import { PrismaClient, PlanNombre, EstadoEmpresa } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
} as any);

async function main() {
    console.log('🌱 Start seeding ...');

    // 1. Crear Plan FREE si no existe
    const plan = await prisma.plan.upsert({
        where: { plan_id: 1 }, // Asumiendo que el ID 1 es el inicial
        update: {},
        create: {
            nombre_plan: PlanNombre.FREE,
            max_usuarios: 2,
            max_productos: 50,
            precio: 0.00,
        },
    });
    console.log('✅ Plan creado:', plan.nombre_plan);

    // 2. Crear un Tenant de prueba
    const tenant = await prisma.tenant.upsert({
        where: { email: 'admin@miempresa.com' },
        update: {},
        create: {
            nombre_empresa: 'Mi Empresa S.R.L',
            email: 'admin@miempresa.com',
            plan_id: plan.plan_id,
            estado: EstadoEmpresa.ACTIVA,
        },
    });
    console.log('✅ Tenant creado:', tenant.nombre_empresa);

    console.log('🌱 Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
