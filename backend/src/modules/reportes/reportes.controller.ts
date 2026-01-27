import { Controller, Get, UseGuards, Request, ForbiddenException, Query } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';
import { FeaturesGuard } from '../../common/guards/features.guard';

@Controller('reportes')
@UseGuards(AuthGuard, RolesGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('admin/stats')
  @Roles(RolUsuario.ADMIN) // Solo super admins
  async getAdminStats() {
    return this.reportesService.getDashboardStats();
  }

  @Get('dashboard')
  @Roles(RolUsuario.PROPIETARIO)
  async getTenantDashboardStats(@Request() req) {
    if (!req.user.tenant_id) {
        throw new ForbiddenException('No tienes un tenant asignado');
    }
    return this.reportesService.getTenantDashboardStats(req.user.tenant_id);
  }

  @Get('vendedor')
  @UseGuards(FeaturesGuard('reportes_avanzados'))
  @Roles(RolUsuario.VENDEDOR, RolUsuario.PROPIETARIO)
  async getVendedorStats(
    @Request() req,
    @Query('filter') filter?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    if (!req.user.tenant_id) {
      throw new ForbiddenException('No tienes un tenant asignado');
    }
    return this.reportesService.getVendedorStats(
      req.user.tenant_id,
      req.user.usuario_id,
      filter,
      startDate,
      endDate
    );
  }
}
