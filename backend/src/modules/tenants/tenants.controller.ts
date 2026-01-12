import { Controller, Patch, Param, Body, UseGuards, ParseIntPipe, Get, Request, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { EstadoEmpresa, RolUsuario } from '@prisma/client';

@Controller('tenants')
@UseGuards(AuthGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('me')
  async findMyTenant(@Request() req) {
    // Si es admin, no tiene tenant_id asugando de la misma forma, o quizas si.
    // Asumimos uso para Propietarios/Usuarios
    if (!req.user.tenant_id) {
       throw new ForbiddenException('No tienes un tenant asignado.');
    }
    return this.tenantsService.findOne(req.user.tenant_id);
  }

  @Get()
  async findAll(@Request() req) {
    if (req.user.rol !== RolUsuario.ADMIN) {
      throw new ForbiddenException('Acceso denegado. Solo administradores.');
    }
    return this.tenantsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    // Si es admin puede ver cualquiera. Si es propietario solo el suyo.
    if (req.user.rol !== RolUsuario.ADMIN && req.user.tenant_id !== id) {
        throw new ForbiddenException('No tienes permiso para ver este tenant.');
    }
    return this.tenantsService.findOne(id);
  }

  @Patch(':id/plan')
  async updatePlan(
    @Param('id', ParseIntPipe) id: number,
    @Body('plan') plan: string,
    @Request() req
  ) {
    // Validar permisos
    if (req.user.rol !== RolUsuario.ADMIN) {
        // Si no es admin, debe ser PROPIETARIO y el ID debe coincidir
        if (req.user.rol !== RolUsuario.PROPIETARIO || req.user.tenant_id !== id) {
             throw new ForbiddenException('No tienes permiso para modificar este tenant.');
        }
    }
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
