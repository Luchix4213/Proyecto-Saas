import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import * as bcrypt from 'bcrypt';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        const email = 'admin@miempresa.com';
        const password = '123456';

        console.log(`Verificando usuario: ${email}`);
        const user = await prisma.usuario.findUnique({ where: { email } });

        if (!user) {
            console.log('❌ Usuario no encontrado en BD.');
            return;
        }

        console.log('✅ Usuario encontrado:', user.usuario_id, user.email, user.rol);
        console.log('Hash en BD:', user.password_hash);

        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log(`Comparando password '${password}': ${isMatch ? '✅ MATCH EXITOSO' : '❌ FALLO COMPARACION'}`);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
