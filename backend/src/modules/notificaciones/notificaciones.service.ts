import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RolUsuario } from '@prisma/client';

@Injectable()
export class NotificacionesService {
  constructor(private prisma: PrismaService) {}

  async crearNotificacion(usuarioId: number, tipo: string, mensaje: string) {
    return this.prisma.notificacion.create({
      data: {
        usuario_id: usuarioId,
        tipo,
        mensaje,
      },
    });
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
}
