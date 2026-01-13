import {
  PrismaClient,
  EstadoEmpresa,
  RolUsuario,
  EstadoGenerico,
} from '@prisma/client';
import 'dotenv/config';
import * as bcrypt from 'bcrypt';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Start seeding ...');

  // 1. Plan FREE
  const plan = await prisma.plan.upsert({
    where: { nombre_plan: 'FREE' },
    update: {},
    create: {
      nombre_plan: 'FREE',
      max_usuarios: 2,
      max_productos: 50,
      precio_mensual: 0,
      precio_anual: 0,
    },
  });

  // 1.1 Plan BASICO
  await prisma.plan.upsert({
    where: { nombre_plan: 'BASICO' },
    update: {},
    create: {
      nombre_plan: 'BASICO',
      max_usuarios: 5,
      max_productos: 50,
      precio_mensual: 99,
      precio_anual: 990, // 10 meses x el precio de 1
      ventas_online: false,
    },
  });

  // 1.2 Plan PREMIUM
  await prisma.plan.upsert({
    where: { nombre_plan: 'PREMIUM' },
    update: {},
    create: {
      nombre_plan: 'PREMIUM',
      max_usuarios: 1000,
      max_productos: 10000,
      precio_mensual: 199,
      precio_anual: 1990, // 10 meses x el precio de 1
      ventas_online: true,
      reportes_avanzados: true,
    },
  });

  // 2. Tenant demo
  const tenant = await prisma.tenant.upsert({
    where: { email: 'admin@miempresa.com' },
    update: {},
    create: {
      nombre_empresa: 'Mi Empresa S.R.L',
      email: 'admin@miempresa.com',
      plan_id: plan.plan_id,
      estado: EstadoEmpresa.ACTIVA,
      moneda: 'BOB',
    },
  });

  // 3. Usuario propietario
  const passwordHash = await bcrypt.hash('123456', 10);

  const usuarioPropietario = await prisma.usuario.upsert({
    where: { email: 'admin@miempresa.com' },
    update: {},
    create: {
      tenant_id: tenant.tenant_id,
      nombre: 'Juan',
      paterno: 'Perez',
      email: 'admin@miempresa.com',
      password_hash: passwordHash,
      rol: RolUsuario.PROPIETARIO,
      estado: EstadoGenerico.ACTIVO,
    },
  });

  // 3.1 Seeding Suscripción de prueba
  await prisma.suscripcion.create({
    data: {
      tenant_id: tenant.tenant_id,
      plan_id: plan.plan_id,
      fecha_inicio: new Date(),
      // 1 mes de duración
      fecha_fin: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      monto: plan.precio_mensual,
      metodo_pago: 'TRANSFERENCIA', // Usando hardcoded enum value o importado
      estado: 'ACTIVA', // Usando enum string directo
    },
  });

  // 4. Tenant del sistema (SaaS)
  const systemTenant = await prisma.tenant.upsert({
    where: { email: 'system@saas.com' },
    update: {},
    create: {
      nombre_empresa: 'SaaS Core',
      email: 'system@saas.com',
      plan_id: plan.plan_id,
      estado: EstadoEmpresa.ACTIVA,
    },
  });

  // 5. Super Admin
  const adminPassword = await bcrypt.hash('admin123', 10);

  await prisma.usuario.upsert({
    where: { email: 'admin@saas.com' },
    update: {},
    create: {
      nombre: 'Super',
      paterno: 'Admin',
      email: 'admin@saas.com',
      password_hash: adminPassword,
      rol: RolUsuario.ADMIN,
      estado: EstadoGenerico.ACTIVO,
      tenant_id: systemTenant.tenant_id,
    },
  });

  console.log('🌱 Seeding finished.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
