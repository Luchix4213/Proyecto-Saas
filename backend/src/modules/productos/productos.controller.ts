import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe, Query } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN, RolUsuario.PROPIETARIO, RolUsuario.VENDEDOR)
  create(@Body() createProductoDto: CreateProductoDto, @Request() req) {
    return this.productosService.create(createProductoDto, req.user.tenant_id);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  findAll(@Request() req) {
    return this.productosService.findAll(req.user.tenant_id);
  }

  // Public Storefront List
  @Get('store/:tenantSlug')
  findAllPublic(@Param('tenantSlug') tenantSlug: string, @Query('categoryId') categoryId?: string) {
    return this.productosService.findAllPublic(tenantSlug, categoryId ? +categoryId : undefined);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.productosService.findOne(id, req.user.tenant_id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN, RolUsuario.PROPIETARIO, RolUsuario.VENDEDOR)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductoDto: UpdateProductoDto, @Request() req) {
    return this.productosService.update(id, updateProductoDto, req.user.tenant_id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN, RolUsuario.PROPIETARIO, RolUsuario.VENDEDOR)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.productosService.remove(id, req.user.tenant_id);
  }
}
