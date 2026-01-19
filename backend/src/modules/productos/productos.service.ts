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
  ) { }

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
      where: { tenant_id: tenantId },
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
      include: { categoria: true, imagenes: { orderBy: { orden: 'asc' } } }
    });
  }

  async addImages(id: number, tenantId: number, files: Array<{ filename: string, path: string }>) {
    const product = await this.findOne(id, tenantId);

    // Get current max order
    const lastImage = await this.prisma.productoImagen.findFirst({
      where: { producto_id: id },
      orderBy: { orden: 'desc' }
    });
    let nextOrder = (lastImage?.orden || 0) + 1;

    // Check if it's the first image ever (to allow making it principal)
    const hasImages = await this.prisma.productoImagen.count({ where: { producto_id: id } });
    let isFirst = hasImages === 0;

    const createdImages: any[] = [];

    for (const file of files) {
      const newImage = await this.prisma.productoImagen.create({
        data: {
          producto_id: id,
          url: `/uploads/products/${file.filename}`,
          orden: nextOrder++,
          es_principal: isFirst, // First uploaded image becomes principal
        }
      });
      createdImages.push(newImage);
      isFirst = false; // Only the very first one is principal (if multiple uploaded)
    }

    return createdImages;
  }

  async removeImage(imageId: number, tenantId: number) {
    // Verify ownership via product
    const image = await this.prisma.productoImagen.findUnique({
      where: { imagen_id: imageId },
      include: { producto: true }
    });

    if (!image || image.producto.tenant_id !== tenantId) {
      throw new NotFoundException('Imagen no encontrada o acceso denegado');
    }

    return this.prisma.productoImagen.delete({
      where: { imagen_id: imageId }
    });
  }

  async setPrincipalImage(imageId: number, tenantId: number) {
    // Verify ownership
    const image = await this.prisma.productoImagen.findUnique({
      where: { imagen_id: imageId },
      include: { producto: true }
    });

    if (!image || image.producto.tenant_id !== tenantId) {
      throw new NotFoundException('Imagen no encontrada');
    }

    // Reset others
    await this.prisma.productoImagen.updateMany({
      where: { producto_id: image.producto_id },
      data: { es_principal: false }
    });

    // Set new principal
    return this.prisma.productoImagen.update({
      where: { imagen_id: imageId },
      data: { es_principal: true }
    });
  }
}
