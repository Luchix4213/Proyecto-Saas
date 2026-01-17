import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { PublicVentasController } from './public-ventas.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';

@Module({
  imports: [PrismaModule, AutenticacionModule],
  controllers: [VentasController, PublicVentasController],
  providers: [VentasService],
  exports: [VentasService],
})
export class VentasModule {}
