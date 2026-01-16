import { Module } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { ComprasController } from './compras.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';

@Module({
  imports: [PrismaModule, AutenticacionModule],
  controllers: [ComprasController],
  providers: [ComprasService],
  exports: [ComprasService],
})
export class ComprasModule {}
