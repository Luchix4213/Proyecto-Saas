import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { Venta, DetalleVenta, Producto, Cliente, Tenant, Usuario } from '@prisma/client';

type VentaWithDetails = Venta & {
    detalles: (DetalleVenta & { producto: Producto })[];
    cliente: Cliente | null;
    usuario: Usuario | null;
    tenant: Tenant;
};

@Injectable()
export class VentasPdfService {
    async generateSalePdf(venta: VentaWithDetails): Promise<Buffer> {
        const isOnline = venta.tipo_venta === 'ONLINE';
        const isFactura = venta.estado_facturacion === 'EMITIDA';

        const pdfBuffer: Buffer = await new Promise((resolve) => {
            const doc = new PDFDocument({
                size: isOnline ? 'A4' : [226, 1200],
                margin: isOnline ? 50 : 15,
            });

            const buffers: Buffer[] = [];
            doc.on('data', (buffer) => buffers.push(buffer));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            if (isOnline) {
                this.generateA4Layout(doc, venta, isFactura);
            } else {
                this.generateTicketLayout(doc, venta, isFactura);
            }

            doc.end();
        });

        return pdfBuffer;
    }

    // ==========================================
    // A4 LAYOUT (For Online Sales)
    // ==========================================

    private generateA4Layout(doc: PDFKit.PDFDocument, venta: VentaWithDetails, isFactura: boolean) {
        // --- Header ---
        doc
            .fillColor('#1e293b')
            .fontSize(20)
            .font('Helvetica-Bold')
            .text(venta.tenant.nombre_empresa, 50, 50)
            .fontSize(10)
            .font('Helvetica')
            .fillColor('#64748b')
            .text(venta.tenant.direccion || '', 200, 55, { align: 'right' })
            .text(venta.tenant.telefono ? `Tel: ${venta.tenant.telefono}` : '', 200, 68, { align: 'right' });

        doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, 100).lineTo(550, 100).stroke();

        // --- Info Section ---
        const title = isFactura ? 'FACTURA' : 'RECIBO DE VENTA';
        doc
            .fillColor('#0f172a')
            .fontSize(24)
            .font('Helvetica-Bold')
            .text(title, 50, 125);

        if (isFactura) {
            this.drawFiscalBoxA4(doc, venta);
        }

        doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('CLIENTE:', 50, 180)
            .font('Helvetica')
            .text(venta.razon_social || venta.cliente?.nombre || 'General', 50, 195)
            .text(`NIT/CI: ${venta.nit_facturacion || venta.cliente?.nit_ci || 'S/N'}`, 50, 208)
            .text(`Fecha: ${new Date(venta.fecha_venta).toLocaleDateString()}`, 50, 221);

        this.generateA4Table(doc, venta);
        this.generateA4Totals(doc, venta);

        if (isFactura) {
            this.generateA4Footer(doc);
        }
    }

    private drawFiscalBoxA4(doc: PDFKit.PDFDocument, venta: VentaWithDetails) {
        doc.roundedRect(350, 120, 200, 80, 10).strokeColor('#e2e8f0').stroke();
        doc
            .fontSize(9)
            .fillColor('#475569')
            .text('NIT:', 365, 135).text('1020304050', 440, 135)
            .text('Nro. Factura:', 365, 150).text(venta.nro_factura || `00${venta.venta_id}`, 440, 150)
            .text('Autorización:', 365, 165).text('3484019000', 440, 165);
    }

    private generateA4Table(doc: PDFKit.PDFDocument, venta: VentaWithDetails) {
        let y = 260;
        doc.rect(50, y, 500, 20).fill('#f8fafc');
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9)
            .text('PRODUCTO', 60, y + 6)
            .text('CANT', 330, y + 6, { width: 40, align: 'center' })
            .text('P. UNIT', 380, y + 6, { width: 80, align: 'right' })
            .text('SUBTOTAL', 470, y + 6, { width: 70, align: 'right' });

        y += 30;
        doc.font('Helvetica').fontSize(10).fillColor('#334155');
        venta.detalles.forEach(item => {
            doc.text(item.producto.nombre, 60, y)
                .text(item.cantidad.toString(), 330, y, { width: 40, align: 'center' })
                .text(Number(item.precio_unitario).toFixed(2), 380, y, { width: 80, align: 'right' })
                .text(Number(item.subtotal).toFixed(2), 470, y, { width: 70, align: 'right' });
            y += 20;
        });
        (doc as any).finalY = y;
    }

    private generateA4Totals(doc: PDFKit.PDFDocument, venta: VentaWithDetails) {
        const y = (doc as any).finalY + 20;
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f172a')
            .text(`TOTAL: ${venta.tenant.moneda} ${Number(venta.total).toFixed(2)}`, 350, y, { align: 'right', width: 190 });
    }

    private generateA4Footer(doc: PDFKit.PDFDocument) {
        doc.fontSize(8).fillColor('#94a3b8').text('"ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO DE ACUERDO A LA LEY"', 50, 750, { align: 'center', width: 500 });
    }

    // ==========================================
    // TICKET LAYOUT (For POS Sales)
    // ==========================================

    private generateTicketLayout(doc: PDFKit.PDFDocument, venta: VentaWithDetails, isFactura: boolean) {
        doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text(venta.tenant.nombre_empresa, { align: 'center' })
            .fontSize(8)
            .font('Helvetica')
            .text(venta.tenant.direccion || '', { align: 'center' })
            .text(venta.tenant.telefono || '', { align: 'center' })
            .moveDown(0.5);

        if (isFactura) {
            doc
                .fontSize(9)
                .font('Helvetica-Bold')
                .text('FACTURA', { align: 'center' })
                .fontSize(7)
                .font('Helvetica')
                .text(`NIT: 1020304050`, { align: 'center' })
                .text(`NRO: ${venta.nro_factura || '00' + venta.venta_id}`, { align: 'center' })
                .moveDown(0.5);
        } else {
            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .text('RECIBO DE VENTA', { align: 'center' })
                .fontSize(8)
                .font('Helvetica')
                .text(`Nro: #${venta.venta_id}`, { align: 'center' })
                .moveDown(0.5);
        }

        doc.text('-------------------------------------------', { align: 'center' });

        // Handle Anonymous Client Logic
        let clienteNombre = venta.razon_social || venta.cliente?.nombre || 'SIN NOMBRE';
        let clienteNit = venta.nit_facturacion || venta.cliente?.nit_ci || '0';

        doc.text(`Cliente: ${clienteNombre}`, { align: 'left' });
        doc.text(`NIT/CI: ${clienteNit}`, { align: 'left' });
        doc.text('-------------------------------------------', { align: 'center' });

        venta.detalles.forEach(item => {
            doc.text(`${item.producto.nombre}`, { align: 'left' });
            doc.text(`${item.cantidad} x ${Number(item.precio_unitario).toFixed(2)}      ${Number(item.subtotal).toFixed(2)}`, { align: 'right' });
        });

        doc.text('-------------------------------------------', { align: 'center' });
        doc.fontSize(12).font('Helvetica-Bold').text(`TOTAL: ${Number(venta.total).toFixed(2)}`, { align: 'right' });

        if (isFactura) {
            doc.moveDown().rect(73, doc.y, 80, 80).stroke();
            doc.fontSize(7).text('CÓDIGO QR', 73, doc.y + 35, { width: 80, align: 'center' });
            doc.moveDown(5).fontSize(6).text('"ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS"', { align: 'center' });
        } else {
            if (venta.monto_recibido) {
                doc
                    .fontSize(9)
                    .font('Helvetica')
                    .text(`Recibido: ${Number(venta.monto_recibido).toFixed(2)}`, { align: 'right' })
                    .text(`Cambio: ${Number(venta.cambio || 0).toFixed(2)}`, { align: 'right' });
            }
            doc.moveDown().fontSize(8).text('¡Gracias por su compra!', { align: 'center' });
            doc.text('No válido para crédito fiscal', { align: 'center' });
        }
    }

    private numberToWords(num: number): string {
        // Very basic mock for now, can be improved with a lib
        return num.toString();
    }
}
