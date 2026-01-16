import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { EstadoEntrega, EstadoGenerico, EstadoVenta } from '@prisma/client';

@Injectable()
export class VentasService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: number, userId: number, createVentaDto: CreateVentaDto) {
    const { cliente_id, productos, tipo_venta, metodo_pago, qr_pago } = createVentaDto;

    return await this.prisma.$transaction(async (prisma) => {
      let totalVenta = 0;
      const detallesParaCrear: any[] = [];

      // 1. Validar y procesar cada producto
      for (const item of productos) {
        const producto = await prisma.producto.findFirst({
          where: {
            producto_id: item.producto_id,
            tenant_id: tenantId,
            estado: EstadoGenerico.ACTIVO,
          },
        });

        if (!producto) {
          throw new NotFoundException(`Producto #${item.producto_id} no encontrado o inactivo.`);
        }

        if (producto.stock_actual < item.cantidad) {
          throw new BadRequestException(`Stock insuficiente para el producto: ${producto.nombre}. Stock actual: ${producto.stock_actual}`);
        }

        // 2. Descontar Stock
        await prisma.producto.update({
          where: { producto_id: item.producto_id },
          data: {
            stock_actual: { decrement: item.cantidad },
          },
        });

        const precioUnitario = Number(producto.precio);
        const subtotal = precioUnitario * item.cantidad;
        totalVenta += subtotal;

        detallesParaCrear.push({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: precioUnitario,
          subtotal: subtotal,
        });
      }

      // 3. Crear cabecera de Venta
      const nuevaVenta = await prisma.venta.create({
        data: {
          tenant_id: tenantId,
          usuario_id: userId,
          cliente_id: cliente_id || null, // Puede ser nulo para cliente genérico
          tipo_venta: tipo_venta,
          metodo_pago: metodo_pago,
          qr_pago: qr_pago,
          total: totalVenta,
          fecha_venta: new Date(),
          estado: EstadoVenta.PAGADA, // Asumimos pagada si es POS directo
          estado_entrega: EstadoEntrega.ENTREGADO, // Asumimos entregado inmediato en POS
          detalles: {
            create: detallesParaCrear,
          },
        },
        include: {
          detalles: {
            include: { producto: true },
          },
          cliente: true,
          usuario: true,
        },
      });

      return nuevaVenta;
    });
  }

  async findAll(tenantId: number) {
    return this.prisma.venta.findMany({
      where: {
        tenant_id: tenantId,
      },
      orderBy: {
        fecha_venta: 'desc',
      },
      include: {
        cliente: true,
        usuario: true,
        detalles: true,
      },
      take: 100, // Limitar a las últimas 100 por ahora
    });
  }

  async findOne(tenantId: number, id: number) {
    const venta = await this.prisma.venta.findFirst({
      where: {
        venta_id: id,
        tenant_id: tenantId,
      },
      include: {
        detalles: {
          include: { producto: true },
        },
        cliente: true,
        usuario: true,
      },
    });

    if (!venta) {
      throw new NotFoundException(`Venta #${id} no encontrada`);
    }

    return venta;
  }
}
