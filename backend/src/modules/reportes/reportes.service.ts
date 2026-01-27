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

    // History (Last 7 days of current week - Mon to Sun)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)

    // Calculate start of week (Monday)
    // If today is Sunday (0), we subtract 6 days. If Monday (1), subtract 0.
    const diffToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - diffToMon);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const salesThisWeek = await this.prisma.venta.groupBy({
        by: ['fecha_venta'],
        _sum: { total: true },
        where: {
            tenant_id: tenantId,
            estado: { not: EstadoVenta.CANCELADA },
            fecha_venta: { gte: startOfWeek, lte: endOfWeek }
        }
    });

    const history = [0, 0, 0, 0, 0, 0, 0]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun

    salesThisWeek.forEach(sale => {
        const date = new Date(sale.fecha_venta);
        // Adjust getDay(): Sunday is 0, we want it to be 6. Mon(1) -> 0.
        let dayIndex = date.getDay() - 1;
        if (dayIndex === -1) dayIndex = 6;

        history[dayIndex] += Number(sale._sum.total || 0);
    });

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

  async getVendedorStats(
    tenantId: number,
    usuarioId: number,
    filter?: string,
    startDate?: string,
    endDate?: string
  ) {
    // Determine date range based on filter
    let rangeStart: Date;
    let rangeEnd: Date = new Date();

    if (filter === 'custom' && startDate && endDate) {
      rangeStart = new Date(startDate);
      rangeEnd = new Date(endDate);
      rangeEnd.setHours(23, 59, 59, 999);
    } else if (filter === 'today') {
      rangeStart = new Date();
      rangeStart.setHours(0, 0, 0, 0);
    } else if (filter === 'month') {
      rangeStart = new Date();
      rangeStart.setDate(1);
      rangeStart.setHours(0, 0, 0, 0);
    } else {
      // Default: 'week'
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diffToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      rangeStart = new Date(today);
      rangeStart.setDate(today.getDate() - diffToMon);
      rangeStart.setHours(0, 0, 0, 0);
    }

    // 1. Today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todaySales = await this.prisma.venta.aggregate({
      _count: { venta_id: true },
      _sum: { total: true },
      where: {
        tenant_id: tenantId,
        usuario_id: usuarioId,
        estado: { not: EstadoVenta.CANCELADA },
        fecha_venta: { gte: todayStart, lte: todayEnd }
      }
    });

    // 2. Week sales (for chart)
    const weekStart = new Date();
    const dayOfWeek = weekStart.getDay();
    const diffToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    weekStart.setDate(weekStart.getDate() - diffToMon);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekSales = await this.prisma.venta.groupBy({
      by: ['fecha_venta'],
      _sum: { total: true },
      where: {
        tenant_id: tenantId,
        usuario_id: usuarioId,
        estado: { not: EstadoVenta.CANCELADA },
        fecha_venta: { gte: weekStart, lte: weekEnd }
      }
    });

    const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const weekData = weekDays.map((day, index) => {
      const dayAmount = weekSales
        .filter(sale => {
          const saleDate = new Date(sale.fecha_venta);
          let dayIndex = saleDate.getDay() - 1;
          if (dayIndex === -1) dayIndex = 6;
          return dayIndex === index;
        })
        .reduce((sum, sale) => sum + Number(sale._sum.total || 0), 0);

      return { day, amount: dayAmount };
    });

    const weekTotal = weekData.reduce((sum, day) => sum + day.amount, 0);

    // 3. Top products (for the selected range)
    const topProducts = await this.prisma.detalleVenta.groupBy({
      by: ['producto_id'],
      _sum: { cantidad: true, precio_unitario: true },
      where: {
        venta: {
          tenant_id: tenantId,
          usuario_id: usuarioId,
          estado: { not: EstadoVenta.CANCELADA },
          fecha_venta: { gte: rangeStart, lte: rangeEnd }
        }
      },
      orderBy: { _sum: { cantidad: 'desc' } },
      take: 5
    });

    const topProductsEnriched = await Promise.all(
      topProducts.map(async (item) => {
        const product = await this.prisma.producto.findUnique({
          where: { producto_id: item.producto_id },
          select: { nombre: true }
        });

        // Calculate total revenue for this product
        const details = await this.prisma.detalleVenta.findMany({
          where: {
            producto_id: item.producto_id,
            venta: {
              tenant_id: tenantId,
              usuario_id: usuarioId,
              estado: { not: EstadoVenta.CANCELADA },
              fecha_venta: { gte: rangeStart, lte: rangeEnd }
            }
          },
          select: { cantidad: true, precio_unitario: true }
        });

        const total = details.reduce((sum, d) => sum + (d.cantidad * Number(d.precio_unitario)), 0);

        return {
          producto_id: item.producto_id,
          nombre: product?.nombre || 'Producto desconocido',
          cantidad: item._sum.cantidad || 0,
          total: total
        };
      })
    );

    // 4. Recent sales
    const recentSales = await this.prisma.venta.findMany({
      where: {
        tenant_id: tenantId,
        usuario_id: usuarioId,
        estado: { not: EstadoVenta.CANCELADA }
      },
      orderBy: { fecha_venta: 'desc' },
      take: 10,
      include: {
        cliente: true
      }
    });

    const recentSalesFormatted = recentSales.map(sale => ({
      venta_id: sale.venta_id,
      fecha: sale.fecha_venta.toISOString(),
      cliente_nombre: sale.cliente
        ? `${sale.cliente.nombre} ${sale.cliente.paterno || ''}`.trim()
        : 'Cliente Casual',
      total: Number(sale.total),
      tipo_comprobante: sale.nro_factura ? 'FACTURA' : 'NOTA'
    }));

    return {
      today: {
        sales: todaySales._count.venta_id || 0,
        amount: Number(todaySales._sum.total || 0)
      },
      week: {
        sales: weekData,
        total: weekTotal
      },
      topProducts: topProductsEnriched,
      recentSales: recentSalesFormatted
    };
  }
}
