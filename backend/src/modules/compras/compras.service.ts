import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { EstadoGenerico, EstadoCompra } from '@prisma/client';

@Injectable()
export class ComprasService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: number, userId: number, createCompraDto: CreateCompraDto) {
    const { proveedor_id, productos } = createCompraDto;

    return await this.prisma.$transaction(async (prisma) => {
      let totalCompra = 0;
      const detallesParaCrear: any[] = [];

      // 1. Validar Proveedor
      const proveedor = await prisma.proveedor.findFirst({
        where: { proveedor_id, tenant_id: tenantId },
      });
      if (!proveedor) throw new NotFoundException('Proveedor no encontrado');

      // 2. Procesar productos
      for (const item of productos) {
        const producto = await prisma.producto.findFirst({
          where: { producto_id: item.producto_id, tenant_id: tenantId },
        });

        if (!producto) {
          throw new NotFoundException(`Producto #${item.producto_id} no encontrado`);
        }

        // 3. Incrementar Stock
        await prisma.producto.update({
          where: { producto_id: item.producto_id },
          data: {
            stock_actual: { increment: item.cantidad },
          },
        });

        const subtotal = item.costo_unitario * item.cantidad;
        totalCompra += subtotal;

        detallesParaCrear.push({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.costo_unitario,
          subtotal: subtotal,
        });
      }

      // 4. Crear Compra
      return await prisma.compra.create({
        data: {
          tenant_id: tenantId,
          usuario_id: userId,
          proveedor_id: proveedor_id,
          fecha_compra: new Date(),
          total: totalCompra,
          estado: EstadoCompra.CONFIRMADA,
          detalles: {
            create: detallesParaCrear,
          },
        },
        include: {
          detalles: { include: { producto: true } },
          proveedor: true,
          usuario: true,
        },
      });
    });
  }

  async findAll(tenantId: number, proveedorId?: number) {
    return this.prisma.compra.findMany({
      where: {
        tenant_id: tenantId,
        ...(proveedorId ? { proveedor_id: proveedorId } : {})
      },
      orderBy: { fecha_compra: 'desc' },
      include: {
        proveedor: true,
        usuario: true,
        detalles: {
          include: {
            producto: true
          }
        }
      },
    });
  }

  async findOne(tenantId: number, id: number) {
    const compra = await this.prisma.compra.findFirst({
      where: { compra_id: id, tenant_id: tenantId },
      include: {
        proveedor: true,
        usuario: true,
        detalles: {
          include: {
            producto: true,
          },
        },
      },
    });

    if (!compra) {
      throw new NotFoundException(`Compra #${id} no encontrada`);
    }

    return compra;
  }
}
