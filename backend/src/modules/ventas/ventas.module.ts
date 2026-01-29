import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { VentasPdfService } from './ventas-pdf.service';
import { EmailService } from '../../common/services/email.service';

import { PrismaModule } from '../../prisma/prisma.module';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';
import { SuscripcionesModule } from '../suscripciones/suscripciones.module';

import { PublicVentasController } from './public-ventas.controller';

@Module({
  imports: [ConfigModule, PrismaModule, AutenticacionModule, SuscripcionesModule],
  controllers: [VentasController, PublicVentasController],
  providers: [VentasService, VentasPdfService, EmailService],
  exports: [VentasService],
})
export class VentasModule { }
