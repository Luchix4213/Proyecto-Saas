import { Controller, Get, Post, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';

@Controller('productos')
@UseGuards(AuthGuard, RolesGuard)
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @Roles(RolUsuario.ADMIN, RolUsuario.PROPIETARIO, RolUsuario.VENDEDOR)
  create(@Body() createProductoDto: CreateProductoDto, @Request() req) {
    return this.productosService.create(createProductoDto, req.user.tenant_id);
  }

  @Get()
  findAll(@Request() req) {
    return this.productosService.findAll(req.user.tenant_id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.productosService.findOne(id, req.user.tenant_id);
  }
}
