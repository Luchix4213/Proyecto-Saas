import {
  PrismaClient,
  EstadoEmpresa,
  RolUsuario,
  EstadoGenerico,
  MetodoPago,
  EstadoSuscripcion,
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
  console.log('Start seeding ...');

  // --- 1. PLANES ---
  console.log('Seeding Planes...');
  const planFree = await prisma.plan.upsert({
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

  const planBasico = await prisma.plan.upsert({
    where: { nombre_plan: 'BASICO' },
    update: {},
    create: {
      nombre_plan: 'BASICO',
      max_usuarios: 5,
      max_productos: 50,
      precio_mensual: 99,
      precio_anual: 990,
      ventas_online: false,
    },
  });

  const planPremium = await prisma.plan.upsert({
    where: { nombre_plan: 'PREMIUM' },
    update: {},
    create: {
      nombre_plan: 'PREMIUM',
      max_usuarios: 1000,
      max_productos: 10000,
      precio_mensual: 199,
      precio_anual: 1990,
      ventas_online: true,
      reportes_avanzados: true,
    },
  });

  // --- 2. RUBROS ---
  console.log('Seeding Rubros...');
  const rubrosData = [
    { nombre: 'Tecnología', descripcion: 'Equipos de computación, celulares y accesorios' },
    { nombre: 'Farmacia', descripcion: 'Medicamentos y productos de salud' },
    { nombre: 'Restaurante', descripcion: 'Comida rápida, almuerzos y cenas' },
    { nombre: 'Veterinaria', descripcion: 'Cuidado y alimentos para mascotas' },
    { nombre: 'Moda', descripcion: 'Ropa, zapatos y accesorios' },
    { nombre: 'Supermercado', descripcion: 'Abarrotes y consumo diario' },
  ];

  const rubrosMap = new Map();

  for (const r of rubrosData) {
    let rubro = await prisma.rubro.findFirst({ where: { nombre: r.nombre } });
    if (!rubro) {
        rubro = await prisma.rubro.create({ data: r });
    }
    rubrosMap.set(r.nombre, rubro);
  }

  // --- 3. SYSTEM TENANT (SaaS Admin) ---
  console.log('Seeding System Tenant...');
  const systemTenant = await prisma.tenant.upsert({
    where: { email: 'system@saas.com' },
    update: {},
    create: {
      nombre_empresa: 'SaaS Core',
      email: 'system@saas.com',
      plan_id: planPremium.plan_id,
      estado: EstadoEmpresa.ACTIVA,
    },
  });

  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.usuario.upsert({
    where: { email: 'admin@saas.com' },
    update: { password_hash: adminPassword },
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

  // --- 4. TENANT 1: TechStore Bolivia ---
  console.log('Seeding Tenant: TechStore Bolivia...');
  const techStore = await prisma.tenant.upsert({
    where: { email: 'contacto@techstore.bo' },
    update: {
        slug: 'techstore-bolivia',
        banner_url: 'https://images.unsplash.com/photo-1531297424005-06b9963a35ab?auto=format&fit=crop&w=1200&q=80',
        logo_url: 'https://cdn-icons-png.flaticon.com/512/3094/3094363.png',
        direccion: 'Av. Heroinas esq. Ayacucho, Cochabamba',
        telefono: '70712345',
        horario_atencion: 'Lunes a Sábado 9:00 - 19:00',
        rubros: {
            connect: [{ rubro_id: rubrosMap.get('Tecnología').rubro_id }]
        }
    },
    create: {
      nombre_empresa: 'TechStore Bolivia',
      email: 'contacto@techstore.bo',
      slug: 'techstore-bolivia',
      plan_id: planFree.plan_id,
      estado: EstadoEmpresa.ACTIVA,
      moneda: 'BOB',
      direccion: 'Av. Heroinas esq. Ayacucho, Cochabamba',
      telefono: '70712345',
      horario_atencion: 'Lunes a Sábado 9:00 - 19:00',
      banner_url: 'https://images.unsplash.com/photo-1531297424005-06b9963a35ab?auto=format&fit=crop&w=1200&q=80',
      rubros: {
          connect: [{ rubro_id: rubrosMap.get('Tecnología').rubro_id }]
      }
    },
  });

  // Suscripción para TechStore
  await prisma.suscripcion.create({
    data: {
      tenant_id: techStore.tenant_id,
      plan_id: techStore.plan_id,
      fecha_inicio: new Date(),
      fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      monto: planFree.precio_mensual,
      metodo_pago: MetodoPago.TRANSFERENCIA,
      estado: EstadoSuscripcion.ACTIVA,
    }
  });

  const techOwnerPassword = await bcrypt.hash('123456', 10);
  await prisma.usuario.upsert({
    where: { email: 'juan@techstore.bo' },
    update: { password_hash: techOwnerPassword },
    create: {
      tenant_id: techStore.tenant_id,
      nombre: 'Juan',
      paterno: 'Tecnológico',
      email: 'juan@techstore.bo',
      password_hash: techOwnerPassword,
      rol: RolUsuario.PROPIETARIO,
      estado: EstadoGenerico.ACTIVO,
    },
  });

  const catLaptops = await prisma.categoria.create({
      data: {
          nombre: 'Laptops',
          descripcion: 'Portátiles de alto rendimiento',
          tenant_id: techStore.tenant_id
      }
  });
  const catPerifericos = await prisma.categoria.create({
      data: {
          nombre: 'Periféricos',
          descripcion: 'Teclados, mouse y audífonos',
          tenant_id: techStore.tenant_id
      }
  });

  const techProducts = [
      {
          tenant_id: techStore.tenant_id,
          categoria_id: catLaptops.categoria_id,
          nombre: 'MacBook Pro M2 14"',
          descripcion: 'Potencia extrema para profesionales.',
          precio: 14500,
          stock_actual: 5,
          slug: 'macbook-pro-m2-14',
          imagen_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&w=800&q=80',
          destacado: true
      },
      {
        tenant_id: techStore.tenant_id,
        categoria_id: catLaptops.categoria_id,
        nombre: 'Dell XPS 13 Plus',
        descripcion: 'Diseño minimalista y pantalla OLED.',
        precio: 10500,
        stock_actual: 8,
        slug: 'dell-xps-13-plus',
        imagen_url: 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?auto=format&fit=crop&w=800&q=80',
        destacado: false
    },
    {
        tenant_id: techStore.tenant_id,
        categoria_id: catPerifericos.categoria_id,
        nombre: 'Logitech MX Master 3S',
        descripcion: 'El mejor mouse para productividad.',
        precio: 850,
        stock_actual: 30,
        slug: 'logitech-mx-master-3s',
        imagen_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
        destacado: true
    }
  ];

  for (const prod of techProducts) {
      const { imagen_url, ...prodData } = prod; // Extract imagen_url

      const p = await prisma.producto.upsert({
          where: { tenant_id_slug: { tenant_id: prodData.tenant_id, slug: prodData.slug } },
          update: {},
          create: {
              ...prodData,
              imagenes: {
                  create: {
                      url: imagen_url,
                      es_principal: true,
                      orden: 1
                  }
              }
          }
      });
  }


  // --- 5. TENANT 2: Farmacia San Juan ---
  console.log('Seeding Tenant: Farmacia San Juan...');
  const farmaStore = await prisma.tenant.upsert({
    where: { email: 'farma@sanjuan.bo' },
    update: {
        slug: 'farmacia-san-juan',
        rubros: { connect: [{ rubro_id: rubrosMap.get('Farmacia').rubro_id }] }
    },
    create: {
      nombre_empresa: 'Farmacia San Juan',
      email: 'farma@sanjuan.bo',
      slug: 'farmacia-san-juan',
      plan_id: planBasico.plan_id,
      estado: EstadoEmpresa.ACTIVA,
      moneda: 'BOB',
      direccion: 'Calle Bolívar #456, La Paz',
      telefono: '22445566',
      horario_atencion: '24 Horas',
      banner_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80',
      rubros: {
          connect: [{ rubro_id: rubrosMap.get('Farmacia').rubro_id }]
      }
    },
  });

  // Suscripción para Farmacia
  await prisma.suscripcion.create({
    data: {
      tenant_id: farmaStore.tenant_id,
      plan_id: farmaStore.plan_id,
      fecha_inicio: new Date(),
      fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      monto: planBasico.precio_mensual,
      metodo_pago: MetodoPago.TRANSFERENCIA,
      estado: EstadoSuscripcion.ACTIVA,
    }
  });

   const farmaOwnerPassword = await bcrypt.hash('123456', 10);
   await prisma.usuario.upsert({
     where: { email: 'maria@farma.bo' },
     update: { password_hash: farmaOwnerPassword },
     create: {
       tenant_id: farmaStore.tenant_id,
       nombre: 'Maria',
       paterno: 'San Juan',
       email: 'maria@farma.bo',
       password_hash: farmaOwnerPassword,
       rol: RolUsuario.PROPIETARIO,
       estado: EstadoGenerico.ACTIVO,
     },
   });

   const catMedicamentos = await prisma.categoria.create({
     data: { nombre: 'Medicamentos', tenant_id: farmaStore.tenant_id }
   });

   const farmaProducts = [
        {
            tenant_id: farmaStore.tenant_id,
            categoria_id: catMedicamentos.categoria_id,
            nombre: 'Paracetamol 500mg',
            descripcion: 'Caja de 50 tabletas.',
            precio: 25,
            stock_actual: 100,
            slug: 'paracetamol-500mg',
            imagen_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
            destacado: true
        }
    ];

    for (const prod of farmaProducts) {
        const { imagen_url, ...prodData } = prod;
        await prisma.producto.upsert({
            where: { tenant_id_slug: { tenant_id: prodData.tenant_id, slug: prodData.slug } },
            update: {},
            create: {
                ...prodData,
                imagenes: {
                  create: {
                      url: imagen_url,
                      es_principal: true,
                      orden: 1
                  }
              }
            }
        });
    }

  const boutiqueStore = await prisma.tenant.upsert({
    where: { email: 'contacto@elegancia.bo' },
    update: {},
    create: {
      nombre_empresa: 'Boutique Elegancia',
      email: 'contacto@elegancia.bo',
      slug: 'boutique-elegancia',
      plan_id: planFree.plan_id,
      estado: EstadoEmpresa.PENDIENTE,
      moneda: 'BOB',
      direccion: 'Zona Sur, Santa Cruz',
      rubros: {
          connect: [{ rubro_id: rubrosMap.get('Moda').rubro_id }]
      }
    },
  });

  // Suscripción para Boutique
  await prisma.suscripcion.create({
    data: {
      tenant_id: boutiqueStore.tenant_id,
      plan_id: boutiqueStore.plan_id,
      fecha_inicio: new Date(),
      fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      monto: planFree.precio_mensual,
      metodo_pago: MetodoPago.TRANSFERENCIA,
      estado: EstadoSuscripcion.ACTIVA,
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
