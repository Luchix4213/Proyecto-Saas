import { Controller, Get, Post, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { SuscripcionesService } from './suscripciones.service';
import { CreateSuscripcionDto } from './dto/create-suscripcion.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';

@Controller('suscripciones')
@UseGuards(AuthGuard, RolesGuard)
export class SuscripcionesController {
  constructor(private readonly suscripcionesService: SuscripcionesService) {}

  // ADMIN/PROPIETARIO: Crear nueva suscripción (o upgrade)
  // Nota: En un flujo real, esto vendría de un webhook de pago o similar.
  // Aquí permitimos al Propietario "contratar" un plan directamente (Demo)
  @Post()
  @Roles(RolUsuario.ADMIN, RolUsuario.PROPIETARIO)
  create(@Body() createSuscripcionDto: CreateSuscripcionDto, @Request() req) {
    const userRole = req.user.rol;
    const tenantId = req.user.tenant_id;

    // Seguridad: Si es PROPIETARIO, solo puede crear para SU tenant
    if (userRole === RolUsuario.PROPIETARIO) {
        if (createSuscripcionDto.tenant_id !== tenantId) {
             throw new ForbiddenException('No puedes crear suscripciones para otro tenant');
        }
    }

    return this.suscripcionesService.create(createSuscripcionDto);
  }

  // ADMIN: Ver todas las suscripciones
  @Get()
  @Roles(RolUsuario.ADMIN)
  findAll() {
    return this.suscripcionesService.findAll();
  }

  // PROPIETARIO: Ver mis suscripciones
  @Get('mis-suscripciones')
  @Roles(RolUsuario.PROPIETARIO)
  findMySubscriptions(@Request() req) {
    const tenantId = req.user.tenant_id;
    return this.suscripcionesService.findByTenant(tenantId);
  }

  // ADMIN: Ver suscripciones de un tenant específico
  @Get('tenant/:tenantId')
  @Roles(RolUsuario.ADMIN)
  findByTenant(@Param('tenantId') tenantId: string) {
    return this.suscripcionesService.findByTenant(+tenantId);
  }

  // PROPIETARIO/ADMIN: Cancelar
  @Post(':id/cancelar')
  @Roles(RolUsuario.ADMIN, RolUsuario.PROPIETARIO)
  async cancel(@Param('id') id: string, @Request() req) {
    const subId = +id;
    const userRole = req.user.rol;
    const tenantId = req.user.tenant_id;

    // Si es propietario, verificar que la suscripción le pertenece
    if (userRole === RolUsuario.PROPIETARIO) {
        const sub = await this.suscripcionesService.findOne(subId);
        if (sub.tenant_id !== tenantId) {
            throw new ForbiddenException('No tienes permiso para cancelar esta suscripción');
        }
    }

    return this.suscripcionesService.cancel(subId);
  }
}
