import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

    const newPlan = await this.prisma.plan.findUnique({
        where: { plan_id: createSuscripcionDto.plan_id }
    });
    if (!newPlan) throw new NotFoundException('Plan no encontrado');

    // VALIDACIÓN ANTI-STACKING: Verificar si ya tiene una suscripción "En Cola" (Activación Futura)
    const suscripcionFutura = await this.prisma.suscripcion.findFirst({
        where: {
            tenant_id: createSuscripcionDto.tenant_id,
            estado: EstadoSuscripcion.ACTIVA,
            fecha_inicio: { gt: new Date() } // greater than now
        }
    });

    if (suscripcionFutura) {
        throw new BadRequestException(`Ya tienes una suscripción programada para iniciar el ${suscripcionFutura.fecha_inicio.toLocaleDateString()}. Debes esperar a que se active antes de realizar otro cambio.`);
    }

    // Lógica de Continuidad...
    const ultimaSuscripcion = await this.prisma.suscripcion.findFirst({
        where: {
            tenant_id: createSuscripcionDto.tenant_id,
            estado: EstadoSuscripcion.ACTIVA
        },
        include: { plan: true },
        orderBy: { fecha_fin: 'desc' }
    });

    let fechaInicio = new Date(); // Por defecto empieza hoy
    let esUpgrade = false;

    // Comparar precios para detectar Upgrade (asumimos precio mensual como referencia de jerarquía)
    if (ultimaSuscripcion) {
        // Si el precio del nuevo plan es MAYOR al precio del plan actual, es un UPGRADE
        // (Nota: Esto es una simplificación, podrías tener un campo 'nivel' en el Plan)
        const precioNuevo = Number(newPlan.precio_mensual);
        const precioActual = Number(ultimaSuscripcion.plan.precio_mensual);

        if (precioNuevo > precioActual) {
            esUpgrade = true;
        }
    }

    // SI TIENE SUSCRIPCIÓN ACTIVA...
    if (ultimaSuscripcion && ultimaSuscripcion.plan.nombre_plan !== 'FREE') {
        if (esUpgrade) {
            // CASO 1: UPGRADE (Inmediato)
            // La nueva empieza HOY
            fechaInicio = new Date();
            // La anterior se marca como CANCELADA (o podrías crear un estado 'SUPERADA')
            // Opcional: Calcular crédito a favor y restar del monto (Prorrateo - pendiente)
        } else {
             // CASO 2: DOWNGRADE o RENOVACIÓN (Diferido)
             // La nueva empieza cuando termina la actual
             if (ultimaSuscripcion.fecha_fin && ultimaSuscripcion.fecha_fin > new Date()) {
                fechaInicio = new Date(ultimaSuscripcion.fecha_fin);
            }
        }
    }

    let fechaFin = new Date(fechaInicio);
    let monto = 0;

    if (createSuscripcionDto.ciclo === 'MENSUAL') {
        fechaFin.setMonth(fechaFin.getMonth() + 1);
        monto = Number(newPlan.precio_mensual);
    } else if (createSuscripcionDto.ciclo === 'ANUAL') {
        fechaFin.setFullYear(fechaFin.getFullYear() + 1);
        monto = Number(newPlan.precio_anual);
    }

    return this.prisma.$transaction(async (prisma) => {
        // Si es Upgrade, cancelamos la anterior para dejar paso a la nueva
        if (esUpgrade && ultimaSuscripcion) {
            await prisma.suscripcion.update({
                where: { suscripcion_id: ultimaSuscripcion.suscripcion_id },
                data: { estado: EstadoSuscripcion.CANCELADA }
                // Nota: Podríamos guardar log de que fue por upgrade
            });
        }

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

        // Actualizar Tenant.plan_id si:
        // 1. Es Upgrade (activación inmediata)
        // 2. O la fecha de inicio es HOY (ej: primera compra o venía de FREE)
        const empiezaHoy = fechaInicio.getTime() <= (new Date()).getTime();

        if (esUpgrade || empiezaHoy) {
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
