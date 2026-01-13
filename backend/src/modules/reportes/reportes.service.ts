import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

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
