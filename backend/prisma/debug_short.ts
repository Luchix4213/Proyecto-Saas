import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const tenants = await prisma.tenant.findMany({
        where: { nombre_empresa: { contains: 'Sistoy', mode: 'insensitive' } }
    });
    for (const t of tenants) {
        console.log(`SLUG: '${t.slug}'`);
        const count = await prisma.producto.count({
            where: { tenant_id: t.tenant_id, estado: 'ACTIVO', stock_actual: { gt: 0 } }
        });
        console.log(`VISIBLE_PRODUCTS: ${count}`);
    }
}

main().finally(() => prisma.$disconnect());
