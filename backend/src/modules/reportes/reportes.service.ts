import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardStats } from './dto/dashboard-stats.dto';
import { EstadoVenta, EstadoEntrega } from '@prisma/client';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async getTenantDashboardStats(tenantId: number): Promise<DashboardStats> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // 1. Sales
    const currentMonthSales = await this.prisma.venta.aggregate({
      _sum: { total: true },
      where: {
        tenant_id: tenantId,
        estado: { not: EstadoVenta.CANCELADA },
        fecha_venta: { gte: firstDayOfMonth }
      }
    });

    const prevMonthSales = await this.prisma.venta.aggregate({
      _sum: { total: true },
      where: {
        tenant_id: tenantId,
        estado: { not: EstadoVenta.CANCELADA },
        fecha_venta: { gte: firstDayOfPrevMonth, lte: lastDayOfPrevMonth }
      }
    });

    const currentTotal = Number(currentMonthSales._sum.total || 0);
    const prevTotal = Number(prevMonthSales._sum.total || 0);

    // Calculate growth
    let growth = 0;
    if (prevTotal > 0) {
        growth = ((currentTotal - prevTotal) / prevTotal) * 100;
    } else if (currentTotal > 0) {
        growth = 100;
    }

    const history = [0, 0, 0, 0, 0, 0, 0]; // Keeping it simple for now

    // 2. Orders
    const totalOrders = await this.prisma.venta.count({
        where: { tenant_id: tenantId }
    });

    const pendingOrders = await this.prisma.venta.count({
        where: {
            tenant_id: tenantId,
            estado_entrega: EstadoEntrega.PENDIENTE
        }
    });

    // 3. Customers
    const totalCustomers = await this.prisma.cliente.count({
        where: { tenant_id: tenantId }
    });

    const newCustomers = await this.prisma.cliente.count({
        where: {
            tenant_id: tenantId,
            fecha_registro: { gte: firstDayOfMonth }
        }
    });

    // 4. Products
    const totalProducts = await this.prisma.producto.count({
        where: { tenant_id: tenantId }
    });

    // Top Selling
    const topSellingItem = await this.prisma.detalleVenta.groupBy({
        by: ['producto_id'],
        _sum: { cantidad: true },
        orderBy: { _sum: { cantidad: 'desc' } },
        where: { venta: { tenant_id: tenantId } },
        take: 1
    });

    let topSellingName = 'Ninguno';
    if (topSellingItem.length > 0) {
        const prod = await this.prisma.producto.findUnique({
            where: { producto_id: topSellingItem[0].producto_id },
            select: { nombre: true }
        });
        if (prod) topSellingName = prod.nombre;
    }

    return {
        sales: {
            total: currentTotal,
            growth: Number(growth.toFixed(1)),
            history
        },
        orders: {
            total: totalOrders,
            pending: pendingOrders
        },
        customers: {
            total: totalCustomers,
            new: newCustomers
        },
        products: {
            total: totalProducts,
            topSelling: topSellingName
        },
        recentOrders: await Promise.all((await this.prisma.venta.findMany({
            where: { tenant_id: tenantId },
            orderBy: { fecha_venta: 'desc' },
            take: 5,
            include: { cliente: true, detalles: true }
        })).map(async (v) => ({
            id: `#ORD-${v.venta_id.toString().padStart(4, '0')}`,
            customer: v.cliente ? `${v.cliente.nombre} ${v.cliente.paterno || ''}`.trim() : 'Cliente Casual',
            items: v.detalles.reduce((acc, d) => acc + d.cantidad, 0),
            total: Number(v.total),
            status: v.estado_entrega,
            date: v.fecha_venta.toLocaleDateString()
        })))
    };
  }


  async getDashboardStats() {
    // 1. Total Tenants
    const totalTenants = await this.prisma.tenant.count({
        where: { nombre_empresa: { not: 'SaaS Core' } } // Excluir tenant del sistema
    });
    const activeTenants = await this.prisma.tenant.count({
      where: { estado: 'ACTIVA', nombre_empresa: { not: 'SaaS Core' } },
    });
    const inactiveTenants = await this.prisma.tenant.count({
      where: { estado: 'INACTIVA', nombre_empresa: { not: 'SaaS Core' } },
    });

    // 2. Total Users (Global) - Excluding system admins if needed, or just total
    const totalUsers = await this.prisma.usuario.count();

    // 3. Plans Distribution (Simple fetch)
    const plansDistribution = await this.prisma.tenant.groupBy({
      by: ['plan_id'],
      _count: {
        _all: true,
      },
      where: { nombre_empresa: { not: 'SaaS Core' } }
    });

    // Enrich plan names
    const enrichedPlans = await Promise.all(plansDistribution.map(async (p) => {
        const plan = await this.prisma.plan.findUnique({ where: { plan_id: p.plan_id } });
        return {
            name: plan?.nombre_plan || 'Desconocido',
            count: p._count._all
        };
    }));

    // 4. Mock Financials (Since we don't have a global payments table fully populated yet)
    // In a real scenario, sum up all Payments/Subscriptions table.
    // For now, estimate based on Plan Price * Active Tenants
    const plansInfo = await this.prisma.plan.findMany();
    let estimatedMonthlyRevenue = 0;

    // We can do this better by fetching tenants with their plans
    const tenantsWithPlans = await this.prisma.tenant.findMany({
        where: { estado: 'ACTIVA', nombre_empresa: { not: 'SaaS Core' } },
        include: { plan: true }
    });

    estimatedMonthlyRevenue = tenantsWithPlans.reduce((acc, t) => {
        return acc + Number(t.plan?.precio_mensual || 0);
    }, 0);

    return {
      tenants: {
        total: totalTenants,
        active: activeTenants,
        inactive: inactiveTenants,
      },
      users: {
        total: totalUsers,
      },
      financials: {
        estimatedMonthlyRevenue: estimatedMonthlyRevenue,
        currency: 'BOB' // Default
      },
      plans: enrichedPlans
    };
  }
}
