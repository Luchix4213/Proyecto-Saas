import { Controller, Get, Post, Body, UseGuards, Request, Query, Param, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from '../../common/utils/file-upload.utils';
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
  @UseInterceptors(FileInterceptor('comprobante', {
    storage: diskStorage({
      destination: './uploads/compras',
      filename: editFileName,
    }),
    fileFilter: imageFileFilter,
  }))
  async create(@Request() req, @Body() body: any, @UploadedFile() file: Express.Multer.File) {
    try {
        console.log('--- CREATE COMPRA REQUEST ---');
        console.log('Body:', JSON.stringify(body, null, 2));

        let createCompraDto: CreateCompraDto;

        if (body.data && typeof body.data === 'string') {
            try {
                createCompraDto = JSON.parse(body.data);
            } catch (e) {
                console.error('JSON Parse Error:', e);
                throw new Error('Invalid JSON data');
            }
        } else {
            createCompraDto = body;
        }

        // --- NEW: Fix parsing for Mobile/FormData ---
        if (createCompraDto) {
            // 1. Array products might come as stringified JSON from mobile FormData
            if (typeof createCompraDto.productos === 'string') {
                try {
                    createCompraDto.productos = JSON.parse(createCompraDto.productos);
                } catch (e) {
                    console.error('Error parsing productos string:', e);
                }
            }

            // 2. Ensure IDs and numeric values are numbers, not strings
            if (createCompraDto.proveedor_id) {
                createCompraDto.proveedor_id = Number(createCompraDto.proveedor_id);
            }

            if (Array.isArray(createCompraDto.productos)) {
                createCompraDto.productos = createCompraDto.productos.map(p => ({
                    ...p,
                    producto_id: Number(p.producto_id),
                    cantidad: Number(p.cantidad),
                    costo_unitario: Number(p.costo_unitario)
                }));
            }
        }

        console.log('Parsed DTO (Fixed):', JSON.stringify(createCompraDto, null, 2));

        return await this.comprasService.create(req.user.tenant_id, req.user.usuario_id, createCompraDto, file);
    } catch (error) {
        console.error('--- ERROR CREATING COMPRA ---');
        console.error(error);
        throw error;
    }
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
