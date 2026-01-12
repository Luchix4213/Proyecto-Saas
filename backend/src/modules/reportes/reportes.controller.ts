import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';

@Controller('admin') // Prefijo /admin
@UseGuards(AuthGuard, RolesGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('stats')
  @Roles(RolUsuario.ADMIN) // Solo super admins
  async getDashboardStats() {
    return this.reportesService.getDashboardStats();
  }
}
