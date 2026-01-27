import { Injectable, CanActivate, ExecutionContext, ForbiddenException, mixin, Type } from '@nestjs/common';
import { CapacidadService } from '../../modules/suscripciones/capacidad.service';

/**
 * Guard para validar si un tenant tiene acceso a una feature específica
 * Uso: @UseGuards(FeaturesGuard('ventas_online'))
 */
export const FeaturesGuard = (feature: 'reportes_avanzados' | 'ventas_online'): Type<CanActivate> => {
    @Injectable()
    class FeaturesGuardMixin implements CanActivate {
        constructor(private capacidadService: CapacidadService) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const request = context.switchToHttp().getRequest();
            const user = request.user;

            if (!user || !user.tenant_id) {
                throw new ForbiddenException('No se encontró información del tenant en la sesión');
            }

            const tieneAcceso = await this.capacidadService.verificarAcceso(user.tenant_id, feature);

            if (!tieneAcceso) {
                const featureNombre = feature === 'ventas_online' ? 'Ventas Online' : 'Reportes Avanzados';
                throw new ForbiddenException(
                    `Tu plan actual no incluye la funcionalidad de ${featureNombre}. Actualiza tu plan para acceder.`
                );
            }

            return true;
        }
    }

    return mixin(FeaturesGuardMixin);
};
