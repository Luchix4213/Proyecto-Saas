import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSuscripcionDto } from './dto/create-suscripcion.dto';
import { UpdateSuscripcionDto } from './dto/update-suscripcion.dto';
import { EstadoSuscripcion, RolUsuario, MetodoPago } from '@prisma/client';

@Injectable()
export class SuscripcionesService {
  constructor(private prisma: PrismaService) { }

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

    // Lógica de Estado Inicial (Verificación de Pago)
    let estadoInicial = createSuscripcionDto.estado || EstadoSuscripcion.ACTIVA;

    // Si es QR o Transferencia y hay comprobante, pasa a PENDIENTE
    if ((createSuscripcionDto.metodo_pago === MetodoPago.QR || createSuscripcionDto.metodo_pago === MetodoPago.TRANSFERENCIA) &&
      createSuscripcionDto.comprobante_url) {
      estadoInicial = EstadoSuscripcion.PENDIENTE;
    }

    return this.prisma.$transaction(async (prisma) => {
      // Solo cancelamos la anterior si la nueva se activa INMEDIATAMENTE
      if (estadoInicial === EstadoSuscripcion.ACTIVA && esUpgrade && ultimaSuscripcion) {
        await prisma.suscripcion.update({
          where: { suscripcion_id: ultimaSuscripcion.suscripcion_id },
          data: { estado: EstadoSuscripcion.CANCELADA }
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
          estado: estadoInicial,
          referencia: createSuscripcionDto.referencia,
          comprobante_url: createSuscripcionDto.comprobante_url,
        },
      });

      // Actualizar Tenant.plan_id SOLO SI la suscripción está ACTIVA
      const empiezaHoy = fechaInicio.getTime() <= (new Date()).getTime();

      if (estadoInicial === EstadoSuscripcion.ACTIVA && (esUpgrade || empiezaHoy)) {
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
      orderBy: [
        { estado: 'asc' }, // PENDIENTE primero (si está en enum antes de ACTIVA/CANCELADA es ideal, sino ordenar por fecha)
        { creado_en: 'desc' }
      ]
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

  // Cancelar suscripción (PROPIETARIO o ADMIN) -> Downgrade a FREE
  async cancel(id: number) {
    // 1. Verificar suscripción actual
    const currentSub = await this.prisma.suscripcion.findUnique({
      where: { suscripcion_id: id },
      include: { tenant: true }
    });
    if (!currentSub) throw new NotFoundException('Suscripción no encontrada');

    // 2. Buscar Plan FREE
    const freePlan = await this.prisma.plan.findFirst({
      where: { nombre_plan: 'FREE' }
    });
    if (!freePlan) throw new NotFoundException('Plan FREE no configurado en el sistema');

    return this.prisma.$transaction(async (prisma) => {
      // 3. Cancelar la suscripción actual (expira hoy)
      await prisma.suscripcion.update({
        where: { suscripcion_id: id },
        data: {
          estado: EstadoSuscripcion.CANCELADA,
          fecha_fin: new Date()
        }
      });

      // 4. Crear nueva suscripción al plan FREE (Activa inmediatamente)
      const fechaInicio = new Date();
      const fechaFin = new Date();
      fechaFin.setFullYear(fechaFin.getFullYear() + 100); // Indefinida/Larga duración

      const newFreeSub = await prisma.suscripcion.create({
        data: {
          tenant_id: currentSub.tenant_id,
          plan_id: freePlan.plan_id,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          monto: 0,
          metodo_pago: MetodoPago.TRANSFERENCIA, // Placeholder para gratuito
          referencia: 'Downgrade automático a FREE',
          estado: EstadoSuscripcion.ACTIVA
        }
      });

      // 5. Actualizar Tenant
      await prisma.tenant.update({
        where: { tenant_id: currentSub.tenant_id },
        data: { plan_id: freePlan.plan_id }
      });

      return newFreeSub;
    });
  }

  // ADMIN: Aprobar suscripción
  async approve(id: number) {
    return this.prisma.$transaction(async (prisma) => {
      const sub = await prisma.suscripcion.findUnique({
        where: { suscripcion_id: id },
        include: { tenant: true }
      });

      if (!sub) throw new NotFoundException('Suscripción no encontrada');
      if (sub.estado !== EstadoSuscripcion.PENDIENTE) throw new BadRequestException('Solo se pueden aprobar suscripciones PENDIENTES');

      // 1. Activar la suscripción
      const updatedSub = await prisma.suscripcion.update({
        where: { suscripcion_id: id },
        data: { estado: EstadoSuscripcion.ACTIVA }
      });

      // 2. Cancelar la anterior ACTIVA si existe (Anti-stacking para upgrades inmediatos)
      await prisma.suscripcion.updateMany({
        where: {
          tenant_id: sub.tenant_id,
          estado: EstadoSuscripcion.ACTIVA,
          suscripcion_id: { not: id }
        },
        data: { estado: EstadoSuscripcion.CANCELADA }
      });

      // 3. Actualizar el Tenant con el nuevo plan
      await prisma.tenant.update({
        where: { tenant_id: sub.tenant_id },
        data: { plan_id: sub.plan_id }
      });

      return updatedSub;
    });
  }

  // ADMIN: Rechazar suscripción
  async reject(id: number) {
    const sub = await this.prisma.suscripcion.findUnique({ where: { suscripcion_id: id } });
    if (!sub) throw new NotFoundException('Suscripción no encontrada');
    if (sub.estado !== EstadoSuscripcion.PENDIENTE) throw new BadRequestException('Solo se pueden rechazar suscripciones PENDIENTES');

    return this.prisma.suscripcion.update({
      where: { suscripcion_id: id },
      data: {
        estado: EstadoSuscripcion.CANCELADA,
        fecha_fin: new Date() // Expira inmediatamente para no ser considerada activa
      }
    });
  }
}
