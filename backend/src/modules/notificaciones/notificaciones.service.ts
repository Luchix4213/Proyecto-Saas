import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RolUsuario } from '@prisma/client';

@Injectable()
export class NotificacionesService {
  constructor(private prisma: PrismaService) { }

  async crearNotificacion(usuarioId: number, tipo: string, mensaje: string) {
    const notificacion = await this.prisma.notificacion.create({
      data: {
        usuario_id: usuarioId,
        tipo,
        mensaje,
      },
      include: { usuario: true }, // Incluir usuario para obtener su expo_push_token
    });

    // Si el usuario tiene un token de Expo, enviar push notification
    if (notificacion.usuario.expo_push_token) {
      await this.sendPushNotification(notificacion.usuario.expo_push_token, mensaje, tipo);
    }

    return notificacion;
  }

  private async sendPushNotification(expoPushToken: string, message: string, title: string) {
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: expoPushToken,
          sound: 'default',
          title: title.replace(/_/g, ' '), // Formatear tipo de notificación
          body: message,
          data: { someData: 'goes here' },
        }),
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  async notificarStockBajo(tenantId: number, productoNombre: string, stockActual: number, stockMinimo: number) {
    // 1. Encontrar usuarios a notificar (Propietarios y Admins del tenant)
    const usuarios = await this.prisma.usuario.findMany({
      where: {
        tenant_id: tenantId,
        rol: { in: [RolUsuario.PROPIETARIO, RolUsuario.ADMIN] },
        estado: 'ACTIVO',
      },
    });

    const mensaje = `El producto "${productoNombre}" tiene stock bajo. Actual: ${stockActual} (Mínimo: ${stockMinimo})`;
    const tipo = stockActual <= 0 ? 'STOCK_AGOTADO' : 'STOCK_BAJO';

    // 2. Crear notificaciones
    const notificaciones = usuarios.map((usuario) =>
      this.crearNotificacion(usuario.usuario_id, tipo, mensaje),
    );

    await Promise.all(notificaciones);
  }

  async notificarCompraRealizada(tenantId: number, compraId: number, cantidadProductos: number) {
    const usuarios = await this.prisma.usuario.findMany({
      where: {
        tenant_id: tenantId,
        rol: { in: [RolUsuario.PROPIETARIO, RolUsuario.ADMIN] },
        estado: 'ACTIVO',
      },
    });

    const mensaje = `Compra #${compraId} registrada exitosamente. Stock actualizado para ${cantidadProductos} productos.`;
    const tipo = 'STOCK_ACTUALIZADO';

    const notificaciones = usuarios.map((usuario) =>
      this.crearNotificacion(usuario.usuario_id, tipo, mensaje),
    );

    await Promise.all(notificaciones);
  }

  async findAllForUser(usuarioId: number) {
    return this.prisma.notificacion.findMany({
      where: { usuario_id: usuarioId },
      orderBy: { fecha_envio: 'desc' },
      take: 100, // Limit to last 100
    });
  }

  async markAsRead(id: number, usuarioId: number) {
    // Only allow user to mark their own notifications
    const notificacion = await this.prisma.notificacion.findFirst({
      where: { notificacion_id: id, usuario_id: usuarioId },
    });

    if (!notificacion) {
      throw new Error('Notificación no encontrada o no pertenece al usuario');
    }

    return this.prisma.notificacion.update({
      where: { notificacion_id: id },
      data: { leida: true },
    });
  }

  async markAllAsRead(usuarioId: number) {
    return this.prisma.notificacion.updateMany({
      where: { usuario_id: usuarioId, leida: false },
      data: { leida: true },
    });
  }

  async remove(id: number, usuarioId: number) {
    const notificacion = await this.prisma.notificacion.findFirst({
      where: { notificacion_id: id, usuario_id: usuarioId },
    });

    if (!notificacion) {
      throw new Error('Notificación no encontrada o no pertenece al usuario');
    }

    return this.prisma.notificacion.delete({
      where: { notificacion_id: id },
    });
  }

  async removeRead(usuarioId: number) {
    return this.prisma.notificacion.deleteMany({
      where: { usuario_id: usuarioId, leida: true },
    });
  }

  // --- NOTIFICACIONES PARA SUPER ADMINS ---

  async notificarNuevaEmpresa(tenantId: number, nombreEmpresa: string) {
    // Buscar todos los Super Admins (Rol ADMIN global)
    // El tenant_id del sistema suele ser 1 (SaaS Core), pero buscamos por rol globalmente
    const admins = await this.prisma.usuario.findMany({
      where: {
        rol: RolUsuario.ADMIN, // Rol global
        estado: 'ACTIVO',
      },
    });

    const mensaje = `Nueva empresa registrada: "${nombreEmpresa}" (ID: ${tenantId}). Pendiente de revisión.`;
    const tipo = 'NUEVA_EMPRESA';

    const notificaciones = admins.map((admin) =>
      this.crearNotificacion(admin.usuario_id, tipo, mensaje),
    );

    await Promise.all(notificaciones);
  }

  async notificarNuevaSuscripcion(tenantId: number, monto: number) {
    const admins = await this.prisma.usuario.findMany({
      where: {
        rol: RolUsuario.ADMIN,
        estado: 'ACTIVO',
      },
    });

    const mensaje = `Nuevo pago de suscripción pendiente por $${monto} (Tenant ID: ${tenantId}).`;
    const tipo = 'NUEVA_SUSCRIPCION';

    const notificaciones = admins.map((admin) =>
      this.crearNotificacion(admin.usuario_id, tipo, mensaje),
    );

    await Promise.all(notificaciones);
  }
}
