import { Controller, Patch, Param, Body, UseGuards, ParseIntPipe, Get, Request, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { EstadoEmpresa, PlanNombre, RolUsuario } from '@prisma/client';

@Controller('tenants')
@UseGuards(AuthGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  async findAll(@Request() req) {
    if (req.user.rol !== RolUsuario.ADMIN) {
      throw new ForbiddenException('Acceso denegado. Solo administradores.');
    }
    return this.tenantsService.findAll();
  }

  @Patch(':id/plan')
  async updatePlan(
    @Param('id', ParseIntPipe) id: number,
    @Body('plan') plan: PlanNombre,
  ) {
    return this.tenantsService.updatePlan(id, plan);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: EstadoEmpresa,
    @Request() req,
  ) {
    if (req.user.rol !== RolUsuario.ADMIN) {
      throw new ForbiddenException('Acceso denegado. Solo administradores.');
    }
    return this.tenantsService.updateStatus(id, estado);
  }
}
