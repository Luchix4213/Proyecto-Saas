import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe, Query, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from '../../common/utils/file-upload.utils';


@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) { }

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

  @Post(':id/imagenes')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN, RolUsuario.PROPIETARIO, RolUsuario.VENDEDOR)
  @UseInterceptors(
    FilesInterceptor('images', 5, { // Allow up to 5 images
      storage: diskStorage({
        destination: './uploads/products',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Request() req
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se han subido imágenes');
    }
    return this.productosService.addImages(id, req.user.tenant_id, files);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN, RolUsuario.PROPIETARIO, RolUsuario.VENDEDOR)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.productosService.remove(id, req.user.tenant_id);
  }

  @Delete('imagenes/:imageId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN, RolUsuario.PROPIETARIO, RolUsuario.VENDEDOR)
  removeImage(@Param('imageId', ParseIntPipe) imageId: number, @Request() req) {
    return this.productosService.removeImage(imageId, req.user.tenant_id);
  }

  @Patch('imagenes/:imageId/principal')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN, RolUsuario.PROPIETARIO, RolUsuario.VENDEDOR)
  setPrincipalImage(@Param('imageId', ParseIntPipe) imageId: number, @Request() req) {
    return this.productosService.setPrincipalImage(imageId, req.user.tenant_id);
  }
}
