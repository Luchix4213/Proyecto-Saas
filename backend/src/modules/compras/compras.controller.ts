import { Controller, Get, Post, Body, UseGuards, Request, Query, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';

@Controller('compras')
@UseGuards(AuthGuard, RolesGuard)
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) { }

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

  @Get(':id/pdf')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.ADMIN)
  async getPdf(@Request() req, @Param('id') id: string, @Res() res: Response) {
    const buffer = await this.comprasService.generarPdf(req.user.tenant_id, +id);

    const compra = await this.comprasService.findOne(req.user.tenant_id, +id);
    const empresa = compra.tenant?.nombre_empresa.replace(/\s+/g, '_') || 'Empresa';
    const fecha = new Date(compra.fecha_compra).toISOString().split('T')[0];

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${empresa}_Compra_${id}_${fecha}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
