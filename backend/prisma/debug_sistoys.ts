import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('--- Inspecting Sistoys Tenant ---');
    // Assuming user said "Sistoys", let's find by fuzzy name or slug
    const tenants = await prisma.tenant.findMany({
        where: { nombre_empresa: { contains: 'Sistoy', mode: 'insensitive' } }
    });

    if (tenants.length === 0) {
        console.log('No tenant found matching "Sistoy"');
        return;
    }

    for (const tenant of tenants) {
        console.log(`Tenant: ${tenant.nombre_empresa} (ID: ${tenant.tenant_id}, Slug: ${tenant.slug})`);
        console.log(`Banner URL: ${tenant.banner_url}`); // checking banner while we are at it

        const products = await prisma.producto.findMany({
            where: { tenant_id: tenant.tenant_id }
        });

        console.log(`Total Products: ${products.length}`);

        // Analyze why they might be hidden
        products.forEach(p => {
            const isActivo = p.estado === 'ACTIVO';
            const hasStock = p.stock_actual > 0;
            const wouldShow = isActivo && hasStock;

            console.log(`- Product: ${p.nombre} | Status: ${p.estado} | Stock: ${p.stock_actual} | SHOWS? ${wouldShow ? 'YES' : 'NO'}`);
            if (!wouldShow) {
                console.log(`  Reason: ${!isActivo ? 'Not ACTIVO. ' : ''}${!hasStock ? 'No Stock (Needs > 0).' : ''}`);
            }
        });
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
