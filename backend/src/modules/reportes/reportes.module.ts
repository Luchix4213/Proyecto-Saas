import { Module } from '@nestjs/common';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { SuscripcionesModule } from '../suscripciones/suscripciones.module';

@Module({
  imports: [PrismaModule, SuscripcionesModule],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
