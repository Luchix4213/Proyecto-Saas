import {
  PrismaClient,
  PlanNombre,
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
    where: { nombre_plan: PlanNombre.FREE },
    update: {},
    create: {
      nombre_plan: PlanNombre.FREE,
      max_usuarios: 2,
      max_productos: 50,
      precio: 0,
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

  await prisma.usuario.upsert({
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
