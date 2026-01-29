import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { EstadoEntrega, EstadoFacturacion, EstadoGenerico, EstadoVenta, TipoVenta, TipoEntrega } from '@prisma/client';
import { VentasPdfService } from './ventas-pdf.service';
import { EmailService } from '../../common/services/email.service';
import { CapacidadService } from '../suscripciones/capacidad.service';

@Injectable()
export class VentasService {
  constructor(
    private prisma: PrismaService,
    private ventasPdfService: VentasPdfService,
    private emailService: EmailService,
    private capacidadService: CapacidadService,
  ) { }

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

    // 2️⃣ Generar PDF y Enviar Correo
    this.generateAndSavePdf(ventaId, tenantId).catch(err => {
      console.error(`Error procesando PDF/Email para Venta #${ventaId}:`, err);
    });

    // 3️⃣ Retornar resultado final
    return ventaActualizada;
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
    const { cliente_id, productos, tipo_venta, metodo_pago, qr_pago,
      monto_recibido, nit_facturacion, razon_social } = createVentaDto;

    const nuevaVenta = await this.prisma.$transaction(async (prisma) => {
      let totalVenta = 0;
      let totalDescuento = 0;
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
        const descuento = item.descuento ? Number(item.descuento) : 0; const subtotal = (precioUnitario * item.cantidad) - descuento;
        totalVenta += subtotal; totalDescuento += descuento;

        detallesParaCrear.push({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: precioUnitario, descuento: descuento,
          subtotal: subtotal,
        });
      }

      // 3. Crear Venta
      return await prisma.venta.create({
        data: {
          tenant_id: tenantId,
          usuario_id: userId,
          cliente_id: cliente_id || null,
          tipo_venta: tipo_venta,
          metodo_pago: metodo_pago,
          qr_pago: qr_pago,
          // Nuevos campos comerciales
          monto_recibido: monto_recibido ? Number(monto_recibido) : null,
          cambio: (monto_recibido && totalVenta) ? Number(monto_recibido) - totalVenta : null,
          nit_facturacion: nit_facturacion,
          razon_social: razon_social,
          estado_facturacion: EstadoFacturacion.PENDIENTE,
          usuario_venta_id: userId,

          total: totalVenta,
          total_descuento: totalDescuento,
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
          tenant: true
        },
      });
    });

    // --- Generate PDF Receipt (Async) ---
    this.generateAndSavePdf(nuevaVenta.venta_id, tenantId).catch(err => {
      console.error(`Error generating PDF for Sale #${nuevaVenta.venta_id}:`, err);
    });

    return nuevaVenta;
  }

  private async generateAndSavePdf(ventaId: number, tenantId: number, shouldSendEmail: boolean = true) {
    const venta = await this.prisma.venta.findFirst({
      where: { venta_id: ventaId, tenant_id: tenantId },
      include: {
        detalles: { include: { producto: true } },
        cliente: true,
        usuario: true,
        tenant: true,
      }
    });

    if (!venta) return;

    const buffer = await this.ventasPdfService.generateSalePdf(venta);
    const filename = `venta_${venta.tenant.nombre_empresa.replace(/\s+/g, '_')}_${ventaId}.pdf`;
    const fs = require('fs');
    const path = require('path');
    const uploadDir = path.join(process.cwd(), 'uploads', 'ventas');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/ventas/${filename}`;

    await this.prisma.venta.update({
      where: { venta_id: ventaId },
      data: { comprobante_pdf: fileUrl }
    });

    // --- Send Email if Online or requested ---
    if (shouldSendEmail && venta.tipo_venta === TipoVenta.ONLINE && venta.cliente?.email) {
      try {
        const html = `
              <h1>Gracias por tu compra</h1>
              <p>Adjunto encontrarás el recibo de tu compra #${ventaId}.</p>
            `;
        await this.emailService.sendEmail(
          venta.cliente.email,
          `Recibo de Compra #${ventaId} - ${venta.tenant.nombre_empresa}`,
          html,
          [{ filename: filename, path: filePath }]
        );
      } catch (error) {
        console.error(`Failed to send email for Sale #${ventaId}:`, error);
        // We don't throw here to avoid failing the whole process if email fails
      }
    }
  }

  async findAll(tenantId: number, query?: { tipo?: TipoVenta; inicio?: string; fin?: string; cliente_id?: number }) {
    const where: any = {
      tenant_id: tenantId,
    };

    if (query?.cliente_id) {
      where.cliente_id = Number(query.cliente_id);
    }

    if (query?.tipo) {
      where.tipo_venta = query.tipo;
    }

    if (query?.inicio || query?.fin) {
      where.fecha_venta = {};
      if (query.inicio) {
        where.fecha_venta.gte = new Date(query.inicio);
      }
      if (query.fin) {
        where.fecha_venta.lte = new Date(query.fin);
      }
    }

    return this.prisma.venta.findMany({
      where,
      orderBy: {
        fecha_venta: 'desc',
      },
      include: {
        cliente: true,
        usuario: true,
        detalles: {
          include: {
            producto: true
          }
        },
      },
      take: 200, // Aumentado para el historial
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
    const { productos, metodo_pago, nombre, email, nit_ci,
      direccion_envio, ubicacion_maps, latitud, longitud, costo_envio, nit_facturacion, razon_social } = checkoutDto;

    const tieneAcceso = await this.capacidadService.verificarAcceso(tenantId, 'ventas_online');
    if (!tieneAcceso) {
      throw new BadRequestException('Tu plan actual no incluye la funcionalidad de Ventas Online. Actualiza tu plan para recibir pedidos.');
    }

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
      let totalDescuento = 0;
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
        const descuento = item.descuento ? Number(item.descuento) : 0; const subtotal = (precioUnitario * item.cantidad) - descuento;
        totalVenta += subtotal; totalDescuento += descuento;

        detallesParaCrear.push({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: precioUnitario, descuento: descuento,
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


          // Nuevos campos comerciales (Logística y Facturación)
          tipo_entrega: checkoutDto.tipo_entrega as any, // Cast to any to avoid strict enum issues if import missing, or use proper Enum if available. checkoutDto usually has string.
          direccion_envio: direccion_envio,
          ubicacion_maps: ubicacion_maps,
          latitud: latitud ? Number(latitud) : null,
          longitud: longitud ? Number(longitud) : null,
          costo_envio: costo_envio ? Number(costo_envio) : null,
          nit_facturacion: nit_facturacion,
          razon_social: razon_social,
          estado_facturacion: EstadoFacturacion.PENDIENTE,
          fecha_despacho: null,
          fecha_entrega: null,

          total: totalVenta,
          total_descuento: totalDescuento,
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
      data: {
        estado_entrega: EstadoEntrega.ENTREGADO,
        fecha_entrega: new Date()
      }
    });
  }

  async setEnCamino(ventaId: number, tenantId: number) {
    const venta = await this.prisma.venta.findFirst({
      where: { venta_id: ventaId, tenant_id: tenantId },
      include: {
        cliente: true,
        tenant: true
      }
    });

    if (!venta) throw new NotFoundException('Venta no encontrada');

    const updated = await this.prisma.venta.update({
      where: { venta_id: ventaId },
      data: {
        estado_entrega: EstadoEntrega.EN_CAMINO,
        fecha_despacho: new Date()
      }
    });

    // Enviar correo de "En Camino"
    if (venta.cliente?.email) {
      try {
        const html = `
              <h1>¡Tu pedido está en camino!</h1>
              <p>Hola ${venta.cliente.nombre},</p>
              <p>Tu pedido #${ventaId} ha salido de nuestra tienda y está en camino a tu dirección.</p>
              ${venta.courier ? `<p>Courier: ${venta.courier}</p>` : ''}
              ${venta.codigo_seguimiento ? `<p>Tracking: ${venta.codigo_seguimiento}</p>` : ''}
              <p>Gracias por comprar en <strong>${venta.tenant.nombre_empresa}</strong>.</p>
            `;
        await this.emailService.sendEmail(
          venta.cliente.email,
          `Tu pedido #${ventaId} está en camino - ${venta.tenant.nombre_empresa}`,
          html
        );
      } catch (error) {
        console.error(`Failed to send In Transit email for Sale #${ventaId}:`, error);
      }
    }

    return updated;
  }

  async uploadComprobante(ventaId: number, filePath: string) {
    // No tenant check here strictly because it's public upload usually,
    // but better if we could validate. For now simplest implementation.
    return this.prisma.venta.update({
      where: { venta_id: ventaId },
      data: { comprobante_pago: filePath }
    });
  }

  async emitInvoice(ventaId: number, tenantId: number) {
    const venta = await this.prisma.venta.findFirst({
      where: { venta_id: ventaId, tenant_id: tenantId }
    });

    if (!venta) throw new NotFoundException('Venta no encontrada');

    const updated = await this.prisma.venta.update({
      where: { venta_id: ventaId },
      data: {
        estado_facturacion: EstadoFacturacion.EMITIDA,
        // Generate a dummy invoice number if not present? Or assume SIAT integration later.
        // For now just update status as requested.
      }
    });

    // Regenerate PDF to Reflect "FACTURA" title
    // Don't resend email for now (or maybe we should? "Your Invoice is ready")
    // For now, no email to keep it simple.
    await this.generateAndSavePdf(ventaId, tenantId, false);

    return updated;
  }

  async getPdf(ventaId: number, tenantId: number): Promise<Buffer> {
    const venta = await this.prisma.venta.findFirst({
      where: { venta_id: ventaId, tenant_id: tenantId },
      include: {
        detalles: { include: { producto: true } },
        cliente: true,
        usuario: true,
        tenant: true,
      }
    });

    if (!venta) throw new NotFoundException('Venta no encontrada');

    // Force type casting or ensure types align, VentasPdfService expects VentaWithDetails
    // which aligns with the include above.
    return this.ventasPdfService.generateSalePdf(venta as any);
  }
}
