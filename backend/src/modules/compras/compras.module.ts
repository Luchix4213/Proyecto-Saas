import { Module } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { ComprasController } from './compras.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { ComprasPdfService } from './compras-pdf.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { EstadoGenerico, EstadoCompra } from '@prisma/client';

@Module({
  imports: [PrismaModule, AutenticacionModule, NotificacionesModule],
  controllers: [ComprasController],
  providers: [ComprasService, ComprasPdfService],
  exports: [ComprasService],
})
export class ComprasModule { }
