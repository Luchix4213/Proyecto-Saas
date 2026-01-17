import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { CustomerAuthController } from './customer-auth.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        PrismaModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'secreto_super_seguro_por_defecto',
                signOptions: { expiresIn: '8h' },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [ClientesController, CustomerAuthController],
    providers: [ClientesService],
    exports: [ClientesService],
})
export class ClientesModule { }
