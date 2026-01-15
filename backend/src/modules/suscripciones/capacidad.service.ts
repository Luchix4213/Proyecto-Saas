import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CapacidadService {
    constructor(private prisma: PrismaService) {}

    /**
     * Valida si el tenant puede crear un nuevo producto según su plan.
     */
    async validarLimiteProductos(tenantId: number) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { tenant_id: tenantId },
            include: { plan: true }
        });

        if (!tenant) throw new ForbiddenException('Tenant no encontrado');

        const productosCount = await this.prisma.producto.count({
            where: { tenant_id: tenantId }
        });

        if (productosCount >= tenant.plan.max_productos) {
            throw new ForbiddenException(
                `Has alcanzado el límite de ${tenant.plan.max_productos} productos de tu plan actual (${tenant.plan.nombre_plan}). Actualiza tu plan para continuar.`
            );
        }
    }

    /**
     * Valida si el tenant puede crear un nuevo usuario según su plan.
     */
    async validarLimiteUsuarios(tenantId: number) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { tenant_id: tenantId },
            include: { plan: true }
        });

        if (!tenant) throw new ForbiddenException('Tenant no encontrado');

        const usuariosCount = await this.prisma.usuario.count({
            where: { tenant_id: tenantId }
        });

        if (usuariosCount >= tenant.plan.max_usuarios) {
            throw new ForbiddenException(
                `Has alcanzado el límite de ${tenant.plan.max_usuarios} usuarios de tu plan actual (${tenant.plan.nombre_plan}). Actualiza tu plan para continuar.`
            );
        }
    }

    /**
     * Verifica acceso genérico a una feature (booleano en el plan)
     */
    async verificarAcceso(tenantId: number, feature: 'reportes_avanzados' | 'ventas_online'): Promise<boolean> {
        const tenant = await this.prisma.tenant.findUnique({
             where: { tenant_id: tenantId },
             include: { plan: true }
        });

        if (!tenant || !tenant.plan) return false;

        return tenant.plan[feature] === true;
    }
}
