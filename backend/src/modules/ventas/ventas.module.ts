import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { VentasPdfService } from './ventas-pdf.service';
import { EmailService } from '../../common/services/email.service';

import { PrismaModule } from '../../prisma/prisma.module';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';

@Module({
  imports: [ConfigModule, PrismaModule, AutenticacionModule],
  controllers: [VentasController],
  providers: [VentasService, VentasPdfService, EmailService],
  exports: [VentasService],
})
export class VentasModule { }
