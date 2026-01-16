import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
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
  findAll(@Request() req) {
    return this.comprasService.findAll(req.user.tenant_id);
  }
}
