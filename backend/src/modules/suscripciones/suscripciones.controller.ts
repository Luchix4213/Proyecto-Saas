import { Controller, Get, Post, Body, Param, UseGuards, Req, ForbiddenException, UseInterceptors, UploadedFile, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from '../../common/utils/file-upload.utils';
import { SuscripcionesService } from './suscripciones.service';
import { CreateSuscripcionDto } from './dto/create-suscripcion.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';
import type { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

@Controller('suscripciones')
@UseGuards(AuthGuard, RolesGuard)
export class SuscripcionesController {
  constructor(private readonly suscripcionesService: SuscripcionesService) { }

  // ADMIN/PROPIETARIO: Crear nueva suscripción (o upgrade)
  // Nota: En un flujo real, esto vendría de un webhook de pago o similar.
  // Aquí permitimos al Propietario "contratar" un plan directamente (Demo)
  @Post()
  @Roles(RolUsuario.ADMIN, RolUsuario.PROPIETARIO)
  @UseInterceptors(
    FileInterceptor('comprobante', {
      storage: diskStorage({
        destination: './uploads/comprobantes',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  create(
    @Body() createSuscripcionDto: CreateSuscripcionDto,
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userRole = req.user.rol;
    const tenantId = req.user.tenant_id;

    // Convertir strings a números si vienen de FormData
    if (typeof createSuscripcionDto.tenant_id === 'string') createSuscripcionDto.tenant_id = Number(createSuscripcionDto.tenant_id);
    if (typeof createSuscripcionDto.plan_id === 'string') createSuscripcionDto.plan_id = Number(createSuscripcionDto.plan_id);

    // Seguridad: Si es PROPIETARIO, solo puede crear para SU tenant
    if (userRole === RolUsuario.PROPIETARIO) {
      if (createSuscripcionDto.tenant_id !== tenantId) {
        throw new ForbiddenException('No puedes crear suscripciones para otro tenant');
      }
    }

    if (file) {
      createSuscripcionDto.comprobante_url = `/uploads/comprobantes/${file.filename}`;
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
  findMySubscriptions(@Req() req: RequestWithUser) {
    const tenantId = req.user.tenant_id;
    return this.suscripcionesService.findByTenant(tenantId);
  }

  // ADMIN: Ver suscripciones de un tenant específico
  @Get('tenant/:tenantId')
  @Roles(RolUsuario.ADMIN)
  findByTenant(@Param('tenantId') tenantId: string) {
    return this.suscripcionesService.findByTenant(+tenantId);
  }

  // ADMIN: Aprobar suscripción pendiente
  @Post(':id/aprobar')
  @Roles(RolUsuario.ADMIN)
  async approve(@Param('id', ParseIntPipe) id: number) {
    return this.suscripcionesService.approve(id);
  }

  // ADMIN: Rechazar suscripción pendiente
  @Post(':id/rechazar')
  @Roles(RolUsuario.ADMIN)
  async reject(@Param('id', ParseIntPipe) id: number) {
    return this.suscripcionesService.reject(id);
  }

  // PROPIETARIO/ADMIN: Cancelar
  @Post(':id/cancelar')
  @Roles(RolUsuario.ADMIN, RolUsuario.PROPIETARIO)
  async cancel(@Param('id') id: string, @Req() req: RequestWithUser) {
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
