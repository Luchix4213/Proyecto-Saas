import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from '../../common/utils/file-upload.utils';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';

@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) { }

  @Post('public/:slug/checkout')
  @UseInterceptors(
    FileInterceptor('comprobante', {
      storage: diskStorage({
        destination: './uploads/comprobantes',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async createOnlineSale(
    @Param('slug') slug: string,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file && body.metodo_pago !== 'EFECTIVO') {
      throw new BadRequestException('El comprobante de pago es obligatorio.');
    }

    let productos = [];
    try {
      productos = typeof body.productos === 'string' ? JSON.parse(body.productos) : body.productos;
    } catch (e) {
      throw new BadRequestException('Formato de productos inválido');
    }

    const checkoutDto = {
      ...body,
      productos,
      comprobante_pago: file ? `/uploads/comprobantes/${file.filename}` : null,
    };

    return this.ventasService.createOnlineSaleBySlug(slug, checkoutDto);
  }

  @Post('public/:slug/ventas/:id/comprobante')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/comprobantes',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadComprobante(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    console.log('Upload Request received for ID:', id);
    if (!file) {
      console.log('No file uploaded');
      throw new BadRequestException('No file uploaded');
    }
    console.log('File uploaded to:', file.filename);
    const path = `/uploads/comprobantes/${file.filename}`;
    return this.ventasService.uploadComprobante(+id, path);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.ADMIN, RolUsuario.VENDEDOR)
  create(@Request() req, @Body() createVentaDto: CreateVentaDto) {
    return this.ventasService.create(req.user.tenant_id, req.user.usuario_id, createVentaDto);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.ADMIN, RolUsuario.VENDEDOR)
  findAll(@Request() req) {
    return this.ventasService.findAll(req.user.tenant_id);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.ADMIN, RolUsuario.VENDEDOR)
  findOne(@Request() req, @Param('id') id: string) {
    return this.ventasService.findOne(req.user.tenant_id, +id);
  }

  @Patch(':id/aprobar')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.ADMIN, RolUsuario.VENDEDOR)
  approvePayment(@Request() req, @Param('id') id: string) {
    return this.ventasService.approvePayment(+id, req.user.tenant_id);
  }

  @Patch(':id/rechazar')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.ADMIN, RolUsuario.VENDEDOR)
  rejectPayment(@Request() req, @Param('id') id: string) {
    return this.ventasService.rejectPayment(+id, req.user.tenant_id);
  }

  @Patch(':id/entregar')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.ADMIN, RolUsuario.VENDEDOR)
  setEntregado(@Request() req, @Param('id') id: string) {
    return this.ventasService.setEntregado(+id, req.user.tenant_id);
  }
}
