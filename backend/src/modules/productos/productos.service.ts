import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CapacidadService } from '../suscripciones/capacidad.service';
import { EstadoGenerico } from '@prisma/client';
import { CreateProductoDto } from './dto/create-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    private prisma: PrismaService,
    private capacidadService: CapacidadService
  ) {}

  async create(createProductoDto: CreateProductoDto, tenantId: number) {
    // 1. Validar Capacidad (Enforcement)
    await this.capacidadService.validarLimiteProductos(tenantId);

    // 2. Crear Producto
    return this.prisma.producto.create({
      data: {
        ...createProductoDto,
        tenant_id: tenantId,
        stock_actual: createProductoDto.stock_actual || 0,
        estado: EstadoGenerico.ACTIVO
      },
    });
  }

  async findAll(tenantId: number) {
    return this.prisma.producto.findMany({
      where: { tenant_id: tenantId },
      include: { categoria: true }
    });
  }

  async findOne(id: number, tenantId: number) {
    const producto = await this.prisma.producto.findFirst({
        where: { producto_id: id, tenant_id: tenantId }
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }
}
