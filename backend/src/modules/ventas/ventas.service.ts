import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { EstadoEntrega, EstadoGenerico, EstadoVenta, TipoVenta } from '@prisma/client';

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

  async createOnlineSale(tenantId: number, clienteId: number | null, checkoutDto: CheckoutDto) {
    const { productos, metodo_pago, nombre, email, nit_ci } = checkoutDto;

    return await this.prisma.$transaction(async (prisma) => {
      let finalClienteId = clienteId;

      // 1. Si no está logueado, intentamos buscar/crear el cliente por email o NIT/CI
      if (!finalClienteId && email) {
        let cliente = await prisma.cliente.findFirst({
          where: {
            email: email,
            tenant_id: tenantId,
          },
        });

        if (!cliente && nit_ci) {
           cliente = await prisma.cliente.findFirst({
            where: {
              nit_ci: nit_ci,
              tenant_id: tenantId,
            },
          });
        }

        if (!cliente) {
          cliente = await prisma.cliente.create({
            data: {
              tenant_id: tenantId,
              nombre: nombre || 'Invitado',
              email: email,
              nit_ci: nit_ci,
            },
          });
        }
        finalClienteId = cliente.cliente_id;
      }

      let totalVenta = 0;
      const detallesParaCrear: any[] = [];

      // 2. Procesar productos y stock
      for (const item of productos) {
        const producto = await prisma.producto.findFirst({
          where: {
            producto_id: item.producto_id,
            tenant_id: tenantId,
            estado: EstadoGenerico.ACTIVO,
          },
        });

        if (!producto) {
          throw new NotFoundException(`Producto #${item.producto_id} no disponible.`);
        }

        if (producto.stock_actual < item.cantidad) {
          throw new BadRequestException(`Stock insuficiente para ${producto.nombre}.`);
        }

        await prisma.producto.update({
          where: { producto_id: item.producto_id },
          data: { stock_actual: { decrement: item.cantidad } },
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

      // 3. Crear Venta Online
      const nuevaVenta = await prisma.venta.create({
        data: {
          tenant_id: tenantId,
          cliente_id: finalClienteId,
          usuario_id: null, // Online, no worker
          tipo_venta: TipoVenta.ONLINE,
          metodo_pago: metodo_pago,
          total: totalVenta,
          fecha_venta: new Date(),
          estado: EstadoVenta.REGISTRADA, // Esperando validación o pago
          estado_entrega: EstadoEntrega.PENDIENTE,
          detalles: {
            create: detallesParaCrear,
          },
        },
        include: {
          detalles: { include: { producto: true } },
          cliente: true,
        },
      });

      return nuevaVenta;
    });
  }
}
