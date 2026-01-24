import { Controller, Get, Post, Body, UseGuards, Request, Query, Param } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';

@Controller('compras')
@UseGuards(AuthGuard, RolesGuard)
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Post()
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.ADMIN)
  create(@Request() req, @Body() createCompraDto: CreateCompraDto) {
    return this.comprasService.create(req.user.tenant_id, req.user.usuario_id, createCompraDto);
  }

  @Get()
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.ADMIN)
  findAll(@Request() req, @Query('proveedor_id') proveedorId?: string) {
    return this.comprasService.findAll(req.user.tenant_id, proveedorId ? Number(proveedorId) : undefined);
  }

  @Get(':id')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.ADMIN)
  findOne(@Request() req, @Param('id') id: string) {
    return this.comprasService.findOne(req.user.tenant_id, Number(id));
  }
}
