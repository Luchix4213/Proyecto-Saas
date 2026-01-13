import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EstadoEmpresa, RolUsuario } from '@prisma/client';
import { CreateTenantDto } from './dto/create-tenant.dto';
import * as bcrypt from 'bcrypt';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) { }

  async create(createTenantDto: CreateTenantDto) {
    const {
      nombre_empresa,
      telefono,
      direccion,
      moneda,
      impuesto_porcentaje,
      plan,
      email,
      email_empresa,
      nombre_contacto,
      paterno_contacto,
      password_contacto,
      horario_atencion
    } = createTenantDto;

    // Verificar si el email del usuario ya existe
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('El email del contacto ya está registrado.');
    }

    // Verificar si el email de la empresa ya existe (si es distinto)
    if (email_empresa) {
      const existingTenantEmail = await this.prisma.tenant.findUnique({
        where: { email: email_empresa }
      });
      if (existingTenantEmail) {
        throw new ConflictException('El email de la empresa ya está registrado.');
      }
    }

    // Buscar el plan
    const planDb = await this.prisma.plan.findFirst({
      where: { nombre_plan: plan || 'FREE' }
    });
    if (!planDb) {
      throw new NotFoundException('Plan no encontrado');
    }

    return await this.prisma.$transaction(async (prisma) => {
      // 1. Crear Tenant
      const newTenant = await prisma.tenant.create({
        data: {
          nombre_empresa,
          telefono,
          direccion,
          moneda: moneda || 'BOB',
          impuesto_porcentaje: impuesto_porcentaje || 0,
          email: email_empresa || email, // Usar email de empresa si existe, sino el del contacto
          horario_atencion,
          plan_id: planDb.plan_id,
          estado: EstadoEmpresa.ACTIVA, // Admin crea empresas ya activas por defecto
        }
      });

      // 2. Hashear password
      const passwordHash = await bcrypt.hash(password_contacto, 10);

      // 3. Crear Usuario Propietario
      const newUser = await prisma.usuario.create({
        data: {
          tenant_id: newTenant.tenant_id,
          email,
          password_hash: passwordHash,
          nombre: nombre_contacto,
          paterno: paterno_contacto,
          rol: RolUsuario.PROPIETARIO,
          estado: 'ACTIVO'
        }
      });

      // Devolver sin password
      const { password_hash, ...userResult } = newUser;
      return {
        tenant: newTenant,
        admin: userResult
      };
    });
  }

  async findOne(id: number) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { tenant_id: id },
      include: {
        plan: true,
        usuarios: true
      },
    });
    if (!tenant) throw new NotFoundException('Tenant no encontrado');
    return tenant;
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      include: {
        plan: true,
      },
      orderBy: {
        fecha_registro: 'desc',
      },
    });
  }

  async update(id: number, updateTenantDto: UpdateTenantDto) {
    await this.findOne(id); // Verificar existencia

    return this.prisma.tenant.update({
      where: { tenant_id: id },
      data: updateTenantDto
    });
  }

  async updatePlan(tenantId: number, planName: string) {
    // Buscar el plan por nombre
    const plan = await this.prisma.plan.findFirst({
      where: { nombre_plan: planName },
    });

    if (!plan) {
      throw new NotFoundException('El plan especificado no existe.');
    }

    // Actualizar el tenant
    return this.prisma.tenant.update({
      where: { tenant_id: tenantId },
      data: { plan_id: plan.plan_id },
    });
  }

  async updateStatus(tenantId: number, estado: EstadoEmpresa) {
    return this.prisma.tenant.update({
      where: { tenant_id: tenantId },
      data: { estado },
    });
  }
}
