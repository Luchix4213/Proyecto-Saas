import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AutenticacionModule, UsuariosModule, MicroempresasModule, ProductosModule, InventarioModule, VentasModule, ComprasModule, ClientesModule, NotificacionesModule, ReportesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
