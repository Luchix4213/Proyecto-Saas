import { Module } from '@nestjs/common';

import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { SuscripcionesModule } from '../suscripciones/suscripciones.module';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [SuscripcionesModule],
  controllers: [ProductosController],
  providers: [ProductosService, PrismaService],
  exports: [ProductosService]
})
export class ProductosModule {}
