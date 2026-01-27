import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('audit')
@UseGuards(AuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('my-tenant')
  @Roles('PROPIETARIO', 'ADMIN')
  @UseGuards(RolesGuard)
  async getMyTenantLogs(@Req() req: any) {
    const tenantId = req.user.tenant_id;
    return this.auditService.getLogsByTenant(tenantId);
  }

  @Get('all')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getAllLogs() {
    return this.auditService.getAllLogs();
  }
}
