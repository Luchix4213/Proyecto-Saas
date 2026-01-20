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

    console.log('Iniciando seed simplificado (solo tenants, planes, rubros, usuarios y suscripciones)...');

    // 1. PLANES
    console.log('Creando/actualizando planes...');
    const planFree = await prisma.plan.upsert({
        where: { nombre_plan: 'FREE' },
        update: {},
        create: {
            nombre_plan: 'FREE',
            descripcion: 'Plan de prueba inicial',
            max_usuarios: 2,
            max_productos: 50,
            ventas_online: false,
            reportes_avanzados: false,
            precio_mensual: 0,
            precio_anual: 0,
            estado: EstadoGenerico.ACTIVO,
        },
    });

    const planBasico = await prisma.plan.upsert({
        where: { nombre_plan: 'BASICO' },
        update: {},
        create: {
            nombre_plan: 'BASICO',
            descripcion: 'Tienda física con funcionalidades básicas',
            max_usuarios: 5,
            max_productos: 300,
            ventas_online: false,
            reportes_avanzados: false,
            precio_mensual: 99.00,
            precio_anual: 990.00,
            estado: EstadoGenerico.ACTIVO,
        },
    });

    const planPremium = await prisma.plan.upsert({
        where: { nombre_plan: 'PREMIUM' },
        update: {},
        create: {
            nombre_plan: 'PREMIUM',
            descripcion: 'Todas las funcionalidades + ventas online',
            max_usuarios: 1000,
            max_productos: 10000,
            ventas_online: true,
            reportes_avanzados: true,
            precio_mensual: 199.00,
            precio_anual: 1990.00,
            estado: EstadoGenerico.ACTIVO,
        },
    });

    // 2. RUBROS
    console.log('Creando rubros...');
    const rubrosData = [
        { nombre: 'Tecnología', descripcion: 'Computadoras, celulares y accesorios' },
        { nombre: 'Farmacia', descripcion: 'Medicamentos y productos de cuidado personal' },
        { nombre: 'Moda', descripcion: 'Ropa, calzado y accesorios de vestir' },
    ];

    const rubrosMap = new Map<string, { rubro_id: number }>();

    for (const data of rubrosData) {
        const rubro = await prisma.rubro.upsert({
            where: { nombre: data.nombre },
            update: {},
            create: {
                nombre: data.nombre,
                descripcion: data.descripcion,
                estado: EstadoGenerico.ACTIVO,
            },
        });
        rubrosMap.set(data.nombre, rubro);
    }

    // 3. SYSTEM TENANT + SUPER ADMIN
    console.log('Creando tenant del sistema y super admin...');
    const systemTenant = await prisma.tenant.upsert({
        where: { slug: 'saas-core' },
        update: {},
        create: {
            nombre_empresa: 'SaaS Core Platform',
            email: 'system@saas.com',
            slug: 'saas-core',
            plan_id: planPremium.plan_id,
            estado: EstadoEmpresa.ACTIVA,
            moneda: 'BOB',
        },
    });

    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.usuario.upsert({
        where: { email: 'admin@saas.com' },
        update: {},
        create: {
            tenant_id: systemTenant.tenant_id,
            nombre: 'Super',
            paterno: 'Admin',
            email: 'admin@saas.com',
            password_hash: adminPassword,
            rol: RolUsuario.ADMIN,
            estado: EstadoGenerico.ACTIVO,
        },
    });

    // 4. Tenant 1: TechStore Bolivia
    console.log('Creando TechStore Bolivia...');
    const techStore = await prisma.tenant.upsert({
        where: { slug: 'techstore-bolivia' },
        update: {},
        create: {
            nombre_empresa: 'TechStore Bolivia',
            email: 'contacto@techstore.bo',
            slug: 'techstore-bolivia',
            plan_id: planFree.plan_id,
            estado: EstadoEmpresa.ACTIVA,
            moneda: 'BOB',
            telefono: '70712345',
            direccion: 'Av. Heroínas esq. Ayacucho, Cochabamba',
        },
    });

    await prisma.tenant.update({
        where: { tenant_id: techStore.tenant_id },
        data: {
            rubros: {
                connect: { rubro_id: rubrosMap.get('Tecnología')!.rubro_id },
            },
        },
    });

    await prisma.suscripcion.create({
        data: {
            tenant_id: techStore.tenant_id,
            plan_id: techStore.plan_id,
            fecha_inicio: new Date(),
            fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            monto: planFree.precio_mensual,
            metodo_pago: MetodoPago.TRANSFERENCIA,
            estado: EstadoSuscripcion.ACTIVA,
        },
    });

    const techOwnerPassword = await bcrypt.hash('123456', 10);
    await prisma.usuario.create({
        data: {
            tenant_id: techStore.tenant_id,
            nombre: 'Juan',
            paterno: 'Pérez',
            email: 'juan@techstore.bo',
            password_hash: techOwnerPassword,
            rol: RolUsuario.PROPIETARIO,
            estado: EstadoGenerico.ACTIVO,
        },
    });

    // 5. Tenant 2: Farmacia San Juan
    console.log('Creando Farmacia San Juan...');
    const farmaStore = await prisma.tenant.upsert({
        where: { slug: 'farmacia-san-juan' },
        update: {},
        create: {
            nombre_empresa: 'Farmacia San Juan',
            email: 'farma@sanjuan.bo',
            slug: 'farmacia-san-juan',
            plan_id: planBasico.plan_id,
            estado: EstadoEmpresa.ACTIVA,
            moneda: 'BOB',
            telefono: '22445566',
            direccion: 'Calle Bolívar #456, La Paz',
            horario_atencion: '24 horas',
        },
    });

    await prisma.tenant.update({
        where: { tenant_id: farmaStore.tenant_id },
        data: {
            rubros: {
                connect: { rubro_id: rubrosMap.get('Farmacia')!.rubro_id },
            },
        },
    });

    await prisma.suscripcion.create({
        data: {
            tenant_id: farmaStore.tenant_id,
            plan_id: farmaStore.plan_id,
            fecha_inicio: new Date(),
            fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            monto: planBasico.precio_mensual,
            metodo_pago: MetodoPago.TRANSFERENCIA,
            estado: EstadoSuscripcion.ACTIVA,
        },
    });

    const farmaOwnerPassword = await bcrypt.hash('123456', 10);
    await prisma.usuario.create({
        data: {
            tenant_id: farmaStore.tenant_id,
            nombre: 'María',
            paterno: 'Gómez',
            email: 'maria@farma.bo',
            password_hash: farmaOwnerPassword,
            rol: RolUsuario.PROPIETARIO,
            estado: EstadoGenerico.ACTIVO,
        },
    });

    // 6. Tenant 3: Boutique Elegancia (PENDIENTE)
    console.log('Creando Boutique Elegancia (en estado PENDIENTE)...');
    const boutiqueStore = await prisma.tenant.upsert({
        where: { slug: 'boutique-elegancia' },
        update: {},
        create: {
            nombre_empresa: 'Boutique Elegancia',
            email: 'contacto@elegancia.bo',
            slug: 'boutique-elegancia',
            plan_id: planFree.plan_id,
            estado: EstadoEmpresa.PENDIENTE,
            moneda: 'BOB',
            direccion: 'Zona Sur, Santa Cruz',
        },
    });

    await prisma.tenant.update({
        where: { tenant_id: boutiqueStore.tenant_id },
        data: {
            rubros: {
                connect: { rubro_id: rubrosMap.get('Moda')!.rubro_id },
            },
        },
    });

    // → No creamos suscripción activa porque está PENDIENTE
    // Si quieres que tenga suscripción pendiente, puedes agregarla aquí

    console.log('Seed completado exitosamente.');
}

main()
    .catch((e) => {
        console.error('Error en el seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });