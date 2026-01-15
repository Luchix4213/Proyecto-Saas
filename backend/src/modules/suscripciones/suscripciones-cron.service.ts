import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { EstadoSuscripcion } from '@prisma/client';

@Injectable()
export class SuscripcionesCronService {
  private readonly logger = new Logger(SuscripcionesCronService.name);

  constructor(private prisma: PrismaService) {}

  // Se ejecuta todos los días a la medianoche (00:00:00)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.debug('Ejecutando tarea cron para revisar suscripciones vencidas...');
    await this.procesarSuscripcionesVencidas();
  }

  async procesarSuscripcionesVencidas() {
    const today = new Date();

    // 1. Buscar suscripciones activas cuya fecha_fin ya pasó
    const suscripcionesVencidas = await this.prisma.suscripcion.findMany({
      where: {
        estado: EstadoSuscripcion.ACTIVA,
        fecha_fin: {
          lt: today, // less than today
        },
      },
      include: {
        tenant: true,
      },
    });

    if (suscripcionesVencidas.length === 0) {
      this.logger.debug('No se encontraron suscripciones vencidas.');
      return;
    }

    this.logger.log(`Encontradas ${suscripcionesVencidas.length} suscripciones vencidas. Procesando...`);

    // 2. Procesar cada una
    for (const sub of suscripcionesVencidas) {
      try {
        await this.prisma.$transaction(async (prisma) => {
          // A. Marcar suscripción como VENCIDA
          await prisma.suscripcion.update({
            where: { suscripcion_id: sub.suscripcion_id },
            data: { estado: EstadoSuscripcion.VENCIDA },
          });

          // B. Buscar el plan FREE
          const freePlan = await prisma.plan.findFirst({
            where: { nombre_plan: 'FREE' }, // Asegúrate que tu seed crea un plan llamado 'FREE' o 'GRATIS'
          });

          if (freePlan) {
            // C. Actualizar el Tenant al plan FREE
            await prisma.tenant.update({
              where: { tenant_id: sub.tenant_id },
              data: { plan_id: freePlan.plan_id },
            });
            this.logger.log(`Tenant ${sub.tenant_id} (${sub.tenant.nombre_empresa}) degradado a FREE.`);
          } else {
            this.logger.warn(`No se encontró plan FREE para degradar al Tenant ${sub.tenant_id}.`);
          }
        });
      } catch (error) {
        this.logger.error(`Error procesando suscripción ${sub.suscripcion_id}: ${error.message}`);
      }
    }
  }
}
