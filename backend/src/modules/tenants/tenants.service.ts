import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EstadoEmpresa } from '@prisma/client';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: number) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { tenant_id: id },
      include: { plan: true },
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
