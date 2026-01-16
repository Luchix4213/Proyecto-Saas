import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';

@Controller('proveedores')
@UseGuards(AuthGuard, RolesGuard)
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Post()
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.ADMIN)
  create(@Request() req, @Body() createProveedorDto: CreateProveedorDto) {
    return this.proveedoresService.create(req.user.tenant_id, createProveedorDto);
  }

  @Get()
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.ADMIN, RolUsuario.VENDEDOR)
  findAll(@Request() req) {
    return this.proveedoresService.findAll(req.user.tenant_id);
  }

  @Get(':id')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.ADMIN, RolUsuario.VENDEDOR)
  findOne(@Request() req, @Param('id') id: string) {
    return this.proveedoresService.findOne(req.user.tenant_id, +id);
  }

  @Patch(':id')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.ADMIN)
  update(@Request() req, @Param('id') id: string, @Body() updateProveedorDto: UpdateProveedorDto) {
    return this.proveedoresService.update(req.user.tenant_id, +id, updateProveedorDto);
  }

  @Delete(':id')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.ADMIN)
  remove(@Request() req, @Param('id') id: string) {
    return this.proveedoresService.remove(req.user.tenant_id, +id);
  }
}
