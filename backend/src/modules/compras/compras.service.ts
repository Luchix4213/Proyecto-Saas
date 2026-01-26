import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { EstadoGenerico, EstadoCompra } from '@prisma/client';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { ComprasPdfService } from './compras-pdf.service';

@Injectable()
export class ComprasService {
  constructor(
    private prisma: PrismaService,
    private notificacionesService: NotificacionesService,
    private comprasPdfService: ComprasPdfService,
  ) { }

  async create(tenantId: number, userId: number, createCompraDto: CreateCompraDto) {
    const { proveedor_id, productos } = createCompraDto;

    const compra = await this.prisma.$transaction(async (prisma) => {
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

        // 3. Incrementar Stock y Vincular Proveedor
        await prisma.producto.update({
          where: { producto_id: item.producto_id },
          data: {
            stock_actual: { increment: item.cantidad },
            proveedor_id: proveedor_id // Link product to this supplier
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
          metodo_pago: createCompraDto.metodo_pago as any, // Cast to enum
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

    // 5. Notificar
    // No esperamos la promesa para no bloquear la respuesta
    this.notificacionesService.notificarCompraRealizada(
      tenantId,
      compra.compra_id,
      compra.detalles.length
    ).catch(e => console.error('Error enviando notificacion de compra', e));

    return compra;
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
        tenant: true, // Need tenant info for PDF
      },
    });

    if (!compra) {
      throw new NotFoundException(`Compra #${id} no encontrada`);
    }

    return compra;
  }

  async generarPdf(tenantId: number, compraId: number): Promise<Buffer> {
    const compra = await this.findOne(tenantId, compraId);
    return this.comprasPdfService.generatePurchasePdf(compra);
  }
}
