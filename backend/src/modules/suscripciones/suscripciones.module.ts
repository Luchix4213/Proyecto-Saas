import { Module } from '@nestjs/common';
import { SuscripcionesService } from '../../modules/suscripciones/suscripciones.service';
import { SuscripcionesController } from '../../modules/suscripciones/suscripciones.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { SuscripcionesCronService } from './suscripciones-cron.service';
import { CapacidadService } from './capacidad.service';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [NotificacionesModule],
  controllers: [SuscripcionesController],
  providers: [SuscripcionesService, PrismaService, SuscripcionesCronService, CapacidadService],
  exports: [SuscripcionesService, CapacidadService],
})
export class SuscripcionesModule {}
