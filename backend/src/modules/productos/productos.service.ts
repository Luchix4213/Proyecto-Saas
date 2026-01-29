import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CapacidadService } from '../suscripciones/capacidad.service';
import { EstadoGenerico } from '@prisma/client';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class ProductosService {
  constructor(
    private prisma: PrismaService,
    private capacidadService: CapacidadService,
    private notificacionesService: NotificacionesService
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
    const newProduct = await this.prisma.producto.create({
      data: {
        ...createProductoDto,
        slug,
        tenant_id: tenantId,
        stock_actual: createProductoDto.stock_actual || 0,
        estado: EstadoGenerico.ACTIVO
      },
    });

    // 4. Check Low Stock Notification
    if (newProduct.stock_actual <= newProduct.stock_minimo) {
      await this.notificacionesService.notificarStockBajo(
        tenantId,
        newProduct.nombre,
        newProduct.stock_actual,
        newProduct.stock_minimo
      );
    }

    return newProduct;
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
    const updatedProduct = await this.prisma.producto.update({
      where: { producto_id: id },
      data: updateProductoDto,
    });

    if (updatedProduct.stock_actual <= updatedProduct.stock_minimo) {
      await this.notificacionesService.notificarStockBajo(
        tenantId,
        updatedProduct.nombre,
        updatedProduct.stock_actual,
        updatedProduct.stock_minimo
      );
    }

    return updatedProduct;
  }

  async remove(id: number, tenantId: number) {
    await this.findOne(id, tenantId);
    return this.prisma.producto.update({
      where: { producto_id: id },
      data: { estado: 'INACTIVO' },
    });
  }

  // --- Public / Marketplace Methods ---

  async findAllPublic(tenantSlug: string, categoryId?: number, search?: string) {
    // Check if identifier is numeric ID (to support tenants without valid slug or access by ID)
    const id = parseInt(tenantSlug);
    const isId = !isNaN(id);

    return this.prisma.producto.findMany({
      where: {
        tenant: {
          OR: [
            { slug: tenantSlug },
            ...(isId ? [{ tenant_id: id }] : [])
          ],
          // Only if tenant has sales enabled
          plan: {
               ventas_online: true
          }
        },
        estado: 'ACTIVO',
        stock_actual: { gt: 0 },
        ...(categoryId ? { categoria_id: categoryId } : {}),
        ...(search ? { nombre: { contains: search, mode: 'insensitive' as const } } : {})
      },
      include: { categoria: true, imagenes: { orderBy: { orden: 'asc' } } }
    });
  }

  async findAllGlobal(categoryId?: number) {
      return this.prisma.producto.findMany({
          where: {
              estado: 'ACTIVO',
              stock_actual: { gt: 0 },
              tenant: {
                  estado: 'ACTIVA', // Only active tenants
                  plan: {
                      ventas_online: true
                  }
              },
              ...(categoryId ? { categoria_id: categoryId } : {})
          },
          include: {
              categoria: true,
              imagenes: { orderBy: { orden: 'asc' } },
              tenant: { // Include tenant info for display
                  select: {
                      tenant_id: true,
                      nombre_empresa: true,
                      slug: true,
                      logo_url: true
                  }
              }
          },
          orderBy: {
              producto_id: 'desc' // Most recent products first (using ID as proxy for creation time)
          },
          take: 50 // Limit for performance
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
