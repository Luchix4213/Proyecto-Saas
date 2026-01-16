import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';

@Controller('ventas')
@UseGuards(AuthGuard, RolesGuard)
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.ADMIN, RolUsuario.VENDEDOR)
  create(@Request() req, @Body() createVentaDto: CreateVentaDto) {
    return this.ventasService.create(req.user.tenant_id, req.user.usuario_id, createVentaDto);
  }

  @Get()
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.ADMIN, RolUsuario.VENDEDOR)
  findAll(@Request() req) {
    return this.ventasService.findAll(req.user.tenant_id);
  }

  @Get(':id')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.ADMIN, RolUsuario.VENDEDOR)
  findOne(@Request() req, @Param('id') id: string) {
    return this.ventasService.findOne(req.user.tenant_id, +id);
  }
}
