import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CapacidadService } from '../suscripciones/capacidad.service';
import { EstadoGenerico } from '@prisma/client';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    private prisma: PrismaService,
    private capacidadService: CapacidadService
  ) {}

  async create(createProductoDto: CreateProductoDto, tenantId: number) {
    // 1. Validar Capacidad (Enforcement)
    await this.capacidadService.validarLimiteProductos(tenantId);

    // 2. Slug generation
    let slug = createProductoDto.slug;
    if (!slug) {
      slug = createProductoDto.nombre.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }

    // Check slug uniqueness within tenant
    const existing = await this.prisma.producto.findFirst({
      where: {
        tenant_id: tenantId,
        slug: slug,
      }
    });

    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    // 3. Crear Producto
    return this.prisma.producto.create({
      data: {
        ...createProductoDto,
        slug,
        tenant_id: tenantId,
        stock_actual: createProductoDto.stock_actual || 0,
        estado: EstadoGenerico.ACTIVO
      },
    });
  }

  async findAll(tenantId: number) {
    return this.prisma.producto.findMany({
      where: { tenant_id: tenantId, estado: 'ACTIVO' },
      include: { categoria: true, imagenes: true }
    });
  }

  async findOne(id: number, tenantId: number) {
    const product = await this.prisma.producto.findFirst({
      where: { producto_id: id, tenant_id: tenantId },
      include: { categoria: true, imagenes: true }
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async update(id: number, updateProductoDto: UpdateProductoDto, tenantId: number) {
    await this.findOne(id, tenantId);
    return this.prisma.producto.update({
      where: { producto_id: id },
      data: updateProductoDto,
    });
  }

  async remove(id: number, tenantId: number) {
    await this.findOne(id, tenantId);
    return this.prisma.producto.update({
      where: { producto_id: id },
      data: { estado: 'INACTIVO' },
    });
  }

  // --- Public / Marketplace Methods ---

  async findAllPublic(tenantSlug: string, categoryId?: number) {
    return this.prisma.producto.findMany({
      where: {
        tenant: { slug: tenantSlug },
        estado: 'ACTIVO',
        stock_actual: { gt: 0 },
        ...(categoryId ? { categoria_id: categoryId } : {})
      },
      include: { categoria: true, imagenes: true }
    });
  }
}
