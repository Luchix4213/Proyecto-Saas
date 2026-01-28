import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const totalTenants = await this.prisma.tenant.count();
    const totalUsers = await this.prisma.usuario.count();

    // MRR Estimation: Sum of all active subscriptions
    const activeSubscriptions = await this.prisma.suscripcion.findMany({
      where: { estado: 'ACTIVA' },
      select: { monto: true }
    });

    // Convert to number strictly to avoid serialization issues with Decimal
    const mrrEstimated = activeSubscriptions.reduce((acc, sub) => acc + Number(sub.monto), 0);

    const activeAlerts = await this.prisma.auditLog.count({
      where: {
        accion: { in: ['DELETE_TENANT', 'SUSPEND_TENANT'] }
      }
    });

    const activityLog = await this.prisma.auditLog.findMany({
      take: 5,
      orderBy: { fecha_hora: 'desc' },
      select: {
        log_id: true,
        accion: true,
        detalle: true,
        fecha_hora: true,
        usuario: { select: { nombre: true, email: true } },
        tenant: { select: { nombre_empresa: true } }
      }
    });

    return {
      total_tenants: totalTenants,
      total_users: totalUsers,
      mrr_estimated: mrrEstimated,
      active_alerts: activeAlerts,
      activity_log: activityLog.map(log => ({
        id: log.log_id,
        action: log.accion,
        target: log.tenant?.nombre_empresa || log.detalle,
        created_at: log.fecha_hora.toISOString(),
        user: log.usuario?.nombre || 'Desconocido'
      }))
    };
  }

  async getGlobalUsers(search?: string) {
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { tenant: { nombre_empresa: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const users = await this.prisma.usuario.findMany({
      where: whereClause,
      take: 50,
      include: {
        tenant: {
           select: {
               nombre_empresa: true,
               slug: true
           }
        }
      },
      orderBy: { fecha_creacion: 'desc' }
    });

    return users.map(u => ({
        usuario_id: u.usuario_id,
        nombre: u.nombre,
        paterno: u.paterno,
        email: u.email,
        rol: u.rol,
        estado: u.estado,
        nombre_empresa: u.tenant.nombre_empresa,
        tenant_slug: u.tenant.slug
    }));
  }
}
