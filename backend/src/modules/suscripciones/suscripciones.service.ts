import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSuscripcionDto } from './dto/create-suscripcion.dto';
import { UpdateSuscripcionDto } from './dto/update-suscripcion.dto';
import { EstadoSuscripcion, RolUsuario, MetodoPago } from '@prisma/client';

@Injectable()
export class SuscripcionesService {
  constructor(private prisma: PrismaService) {}

  // ADMIN: Crear una suscripción manualmente (ej: pago por transferencia verificado)
  async create(createSuscripcionDto: CreateSuscripcionDto) {
    // Verificar existencia de tenant y plan
    const tenant = await this.prisma.tenant.findUnique({
        where: { tenant_id: createSuscripcionDto.tenant_id }
    });
    if (!tenant) throw new NotFoundException('Tenant no encontrado');

    const plan = await this.prisma.plan.findUnique({
        where: { plan_id: createSuscripcionDto.plan_id }
    });
    if (!plan) throw new NotFoundException('Plan no encontrado');

    // Calcular fechas y monto según ciclo
    const fechaInicio = new Date(createSuscripcionDto.fecha_inicio);
    let fechaFin = new Date(fechaInicio);
    let monto = 0;

    if (createSuscripcionDto.ciclo === 'MENSUAL') {
        fechaFin.setMonth(fechaFin.getMonth() + 1);
        monto = Number(plan.precio_mensual);
    } else if (createSuscripcionDto.ciclo === 'ANUAL') {
        fechaFin.setFullYear(fechaFin.getFullYear() + 1);
        monto = Number(plan.precio_anual);
    }

    return this.prisma.$transaction(async (prisma) => {
        const subscription = await prisma.suscripcion.create({
          data: {
            tenant_id: createSuscripcionDto.tenant_id,
            plan_id: createSuscripcionDto.plan_id,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            monto: monto,
            metodo_pago: createSuscripcionDto.metodo_pago as MetodoPago,
            estado: createSuscripcionDto.estado || EstadoSuscripcion.ACTIVA,
            referencia: createSuscripcionDto.referencia,
          },
        });

        // Actualizar el plan del tenant si la suscripción está ACTIVA
        if (subscription.estado === EstadoSuscripcion.ACTIVA) {
            await prisma.tenant.update({
                where: { tenant_id: createSuscripcionDto.tenant_id },
                data: { plan_id: createSuscripcionDto.plan_id }
            });
        }

        return subscription;
    });
  }

  // ADMIN: Ver todas las suscripciones (Historial global)
  async findAll() {
    return this.prisma.suscripcion.findMany({
      include: {
        tenant: {
            select: { nombre_empresa: true, email: true }
        },
        plan: {
            select: { nombre_plan: true }
        }
      },
      orderBy: { creado_en: 'desc' }
    });
  }

  // PROPIETARIO: Ver mis suscripciones
  async findByTenant(tenantId: number) {
    return this.prisma.suscripcion.findMany({
      where: { tenant_id: tenantId },
      include: {
        plan: {
            select: { nombre_plan: true, precio_mensual: true, precio_anual: true }
        }
      },
      orderBy: { creado_en: 'desc' }
    });
  }

  // Ver una suscripción específica
  async findOne(id: number) {
    const suscripcion = await this.prisma.suscripcion.findUnique({
      where: { suscripcion_id: id },
      include: {
        tenant: true,
        plan: true
      }
    });
    if (!suscripcion) throw new NotFoundException('Suscripción no encontrada');
    return suscripcion;
  }

  // Cancelar suscripción (PROPIETARIO o ADMIN)
  async cancel(id: number) {
    return this.prisma.suscripcion.update({
        where: { suscripcion_id: id },
        data: { estado: EstadoSuscripcion.CANCELADA }
    });
  }
}
