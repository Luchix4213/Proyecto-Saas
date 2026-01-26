import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { EstadoEntrega, EstadoGenerico, EstadoVenta, TipoVenta } from '@prisma/client';
import * as nodemailer from 'nodemailer';

@Injectable()
export class VentasService {
  private transporter;

  constructor(private prisma: PrismaService) {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  private async sendOrderEmail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      console.warn('Autorización de correo fallida: SMTP no configurado.');
      return;
    }
    try {
      await this.transporter.sendMail({
        from: `"Kipu Market" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
      });
      console.log(`Correo enviado a ${to}`);
    } catch (e) {
      console.error('Error enviando correo:', e);
    }
  }

  async findClientByNit(tenantId: number, nit: string) {
    return this.prisma.cliente.findFirst({
      where: {
        tenant_id: tenantId,
        nit_ci: nit
      }
    });
  }

  async findClientByNitAndSlug(slug: string, nit: string) {
    const id = parseInt(slug);
    const isId = !isNaN(id);

    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [
          { slug: slug },
          ...(isId ? [{ tenant_id: id }] : [])
        ]
      }
    });

    if (!tenant) throw new NotFoundException('Tienda no encontrada');
    return this.findClientByNit(tenant.tenant_id, nit);
  }

  async create(tenantId: number, userId: number, createVentaDto: CreateVentaDto) {
    const { cliente_id, productos, tipo_venta, metodo_pago, qr_pago } = createVentaDto;

    return await this.prisma.$transaction(async (prisma) => {
      let totalVenta = 0;
      const detallesParaCrear: any[] = [];

      //productos
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

        //stock
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

      // 3. Crear Venta
      const nuevaVenta = await prisma.venta.create({
        data: {
          tenant_id: tenantId,
          usuario_id: userId,
          cliente_id: cliente_id || null,
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

  async createOnlineSaleBySlug(slug: string, checkoutDto: CheckoutDto) {
    const id = parseInt(slug);
    const isId = !isNaN(id);

    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [
          { slug: slug },
          ...(isId ? [{ tenant_id: id }] : [])
        ]
      }
    });
    if (!tenant) throw new NotFoundException('Tienda no encontrada');
    return this.createOnlineSale(tenant.tenant_id, null, checkoutDto);
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
              paterno: checkoutDto.paterno || null,
              materno: checkoutDto.materno || null,
              telefono: checkoutDto.telefono || null,
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

        // NO descontar stock todavía (se hace al confirmar el pago)
        // await prisma.producto.update({
        //   where: { producto_id: item.producto_id },
        //   data: { stock_actual: { decrement: item.cantidad } },
        // });

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
          usuario_id: null,
          tipo_venta: TipoVenta.ONLINE,
          metodo_pago: metodo_pago,
          total: totalVenta,
          fecha_venta: new Date(),
          estado: EstadoVenta.REGISTRADA,
          estado_entrega: EstadoEntrega.PENDIENTE,
          comprobante_pago: checkoutDto.comprobante_pago || null,
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

  async approvePayment(ventaId: number, tenantId: number) {

    // 1️⃣ Ejecutar la transacción
    const ventaActualizada = await this.prisma.$transaction(async (prisma) => {

      const venta = await prisma.venta.findFirst({
        where: { venta_id: ventaId, tenant_id: tenantId },
        include: { detalles: true }
      });

      if (!venta) throw new NotFoundException('Venta no encontrada');
      if (venta.estado === EstadoVenta.PAGADA) throw new BadRequestException('Venta ya pagada');
      if (venta.estado === EstadoVenta.CANCELADA) throw new BadRequestException('Venta cancelada');

      // Validar y descontar stock
      for (const detalle of venta.detalles) {
        const producto = await prisma.producto.findUnique({
          where: { producto_id: detalle.producto_id }
        });

        if (!producto || producto.stock_actual < detalle.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para ${producto?.nombre || 'Producto'}`
          );
        }

        await prisma.producto.update({
          where: { producto_id: detalle.producto_id },
          data: { stock_actual: { decrement: detalle.cantidad } }
        });
      }

      // Actualizar estado
      return prisma.venta.update({
        where: { venta_id: ventaId },
        data: { estado: EstadoVenta.PAGADA }
      });
    });

    // 2️⃣ FUERA de la transacción → enviar correo
    const ventaConCliente = await this.prisma.venta.findUnique({
      where: { venta_id: ventaId },
      include: { cliente: true }
    });

    if (!ventaConCliente || !ventaConCliente.cliente) {
      return ventaActualizada;
    }

    const email: string | null = ventaConCliente.cliente.email;
    const nombre = ventaConCliente.cliente.nombre ?? 'Cliente';

    if (!email) {
      return ventaActualizada;
    }

    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #0d9488;">¡Tu pedido #${ventaId} ha sido aprobado!</h2>
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Hemos verificado tu pago y tu pedido está confirmado.</p>
        <p style="font-size: 12px; color: #666;">Gracias por comprar con Kipu.</p>
      </div>
    `;

    await this.sendOrderEmail(email, `Pedido #${ventaId} Aprobado`, html);

    // 3️⃣ Retornar resultado final
    return ventaActualizada;
  }


  async rejectPayment(ventaId: number, tenantId: number) {
    const venta = await this.prisma.venta.findFirst({
      where: { venta_id: ventaId, tenant_id: tenantId }
    });
    if (!venta) throw new NotFoundException('Venta no encontrada');

    return this.prisma.venta.update({
      where: { venta_id: ventaId },
      data: { estado: EstadoVenta.CANCELADA }
    });
  }

  async setEntregado(ventaId: number, tenantId: number) {
    return this.prisma.venta.updateMany({
      where: { venta_id: ventaId, tenant_id: tenantId },
      data: { estado_entrega: EstadoEntrega.ENTREGADO }
    });
  }

  async uploadComprobante(ventaId: number, filePath: string) {
    // No tenant check here strictly because it's public upload usually, 
    // but better if we could validate. For now simplest implementation.
    return this.prisma.venta.update({
      where: { venta_id: ventaId },
      data: { comprobante_pago: filePath }
    });
  }
}
