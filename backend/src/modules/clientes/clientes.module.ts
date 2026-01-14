import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ClientesController],
    providers: [ClientesService],
    exports: [ClientesService], // Exportamos por si otros módulos (ej: Ventas) necesitan buscar clientes
})
export class ClientesModule { }
