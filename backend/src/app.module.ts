import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AutenticacionModule } from './modules/autenticacion/autenticacion.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { MicroempresasModule } from './modules/microempresas/microempresas.module';
import { ProductosModule } from './modules/productos/productos.module';
import { InventarioModule } from './modules/inventario/inventario.module';
import { VentasModule } from './modules/ventas/ventas.module';
import { ComprasModule } from './modules/compras/compras.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { PrismaModule } from './prisma/prisma.module';

import { TenantsModule } from './modules/tenants/tenants.module';
import { PlanesModule } from './modules/planes/planes.module';
import { SuscripcionesModule } from './modules/suscripciones/suscripciones.module';

import { ScheduleModule } from '@nestjs/schedule';
import { RubrosModule } from './modules/rubros/rubros.module';
import { CategoriesModule } from './modules/categories/categories.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Enable Cron Jobs
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    AutenticacionModule, UsuariosModule, MicroempresasModule, ProductosModule, InventarioModule, VentasModule, ComprasModule, ClientesModule, NotificacionesModule, ReportesModule, PrismaModule, TenantsModule, PlanesModule, SuscripcionesModule, RubrosModule, CategoriesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
