import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        const users = await prisma.usuario.findMany();
        console.log('--------------- USUARIOS EN BD (CHECK SCRIPT) ---------------');
        console.log(users);
        console.log('-------------------------------------------------------------');

        const count = await prisma.usuario.count();
        console.log(`Total usuarios: ${count}`);
    } catch (e) {
        console.error('Error conectando a BD:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
