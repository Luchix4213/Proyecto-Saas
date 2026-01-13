import { Module } from '@nestjs/common';
import { SuscripcionesService } from '../../modules/suscripciones/suscripciones.service';
import { SuscripcionesController } from '../../modules/suscripciones/suscripciones.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [SuscripcionesController],
  providers: [SuscripcionesService, PrismaService],
  exports: [SuscripcionesService],
})
export class SuscripcionesModule {}
