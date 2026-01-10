const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    console.log('🌱 Start seeding (JS)...');

    try {
        // 1. Crear Plan FREE
        await pool.query(`
      INSERT INTO "Plan" (plan_id, nombre_plan, max_usuarios, max_productos, ventas_online, reportes_avanzados, precio, estado)
      VALUES (1, 'FREE', 2, 50, false, false, 0.00, 'ACTIVO')
      ON CONFLICT (plan_id) DO NOTHING;
    `);
        console.log('✅ Plan creado/verificado.');

        // 2. Crear Tenant
        await pool.query(`
      INSERT INTO "Tenant" (nombre_empresa, email, plan_id, estado, moneda, impuesto_porcentaje, fecha_registro)
      VALUES ('Mi Empresa S.R.L', 'admin@miempresa.com', 1, 'ACTIVA', 'BOB', 0, NOW())
      ON CONFLICT (email) DO NOTHING;
    `);
        console.log('✅ Tenant creado/verificado.');

    } catch (err) {
        console.error('Error seeding:', err);
    } finally {
        await pool.end();
    }
}

main();
