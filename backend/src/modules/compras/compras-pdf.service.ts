import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { Compra, DetalleCompra, Producto, Proveedor, Tenant, Usuario } from '@prisma/client';

type CompraWithDetails = Compra & {
    detalles: (DetalleCompra & { producto: Producto })[];
    proveedor: Proveedor;
    usuario: Usuario;
    tenant: Tenant;
};

@Injectable()
export class ComprasPdfService {
    async generatePurchasePdf(compra: CompraWithDetails): Promise<Buffer> {
        const pdfBuffer: Buffer = await new Promise((resolve) => {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
            });

            const buffers: Buffer[] = [];
            doc.on('data', (buffer) => buffers.push(buffer));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // --- Header ---
            this.generateHeader(doc, compra);

            // --- Supplier & Purchase Info ---
            this.generateInfo(doc, compra);

            // --- Table ---
            this.generateTable(doc, compra);

            // --- Footer ---
            this.generateFooter(doc, compra);

            doc.end();
        });

        return pdfBuffer;
    }

    private generateHeader(doc: PDFKit.PDFDocument, compra: CompraWithDetails) {
        doc
            .fillColor('#444444')
            .fontSize(20)
            .text(compra.tenant.nombre_empresa || 'Empresa', 50, 57)
            .fontSize(10)
            .text(compra.tenant.direccion || '', 200, 65, { align: 'right' })
            .text(compra.tenant.telefono || '', 200, 80, { align: 'right' })
            .moveDown();

        doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 100).lineTo(550, 100).stroke();
    }

    private generateInfo(doc: PDFKit.PDFDocument, compra: CompraWithDetails) {
        doc
            .fillColor('#000000')
            .fontSize(16)
            .text('COMPROBANTE DE COMPRA', 50, 130);

        doc
            .fontSize(10)
            .text(`Nro. Compra: #${compra.compra_id}`, 50, 160)
            .text(`Fecha: ${new Date(compra.fecha_compra).toLocaleDateString()}`, 50, 175)
            .text(`Método Pago: ${compra.metodo_pago}`, 50, 190)
            .text(`Registrado por: ${compra.usuario.nombre}`, 50, 205);

        doc
            .fontSize(10)
            .text('PROVEEDOR:', 300, 160)
            .font('Helvetica-Bold')
            .text(compra.proveedor.nombre, 300, 175)
            .font('Helvetica')
            .text(`Tel: ${compra.proveedor.telefono || '-'}`, 300, 190)
            .text(`Email: ${compra.proveedor.email || '-'}`, 300, 205);

        doc.moveDown();
    }

    private generateTable(doc: PDFKit.PDFDocument, compra: CompraWithDetails) {
        let i = 250;
        const itemHeight = 20;

        // Table Header
        doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('Producto', 50, i)
            .text('Cantidad', 280, i, { width: 90, align: 'right' })
            .text('Costo Unit.', 370, i, { width: 90, align: 'right' })
            .text('Total', 460, i, { width: 90, align: 'right' });

        doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, i + 15).lineTo(550, i + 15).stroke();

        i += 30;
        doc.font('Helvetica');

        // Items
        compra.detalles.forEach((item) => {
            doc
                .fontSize(10)
                .text(item.producto.nombre, 50, i)
                .text(item.cantidad.toString(), 280, i, { width: 90, align: 'right' })
                .text(Number(item.precio_unitario).toFixed(2), 370, i, { width: 90, align: 'right' })
                .text(Number(item.subtotal).toFixed(2), 460, i, { width: 90, align: 'right' });

            i += itemHeight;
        });

        doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, i + 10).lineTo(550, i + 10).stroke();
    }

    private generateFooter(doc: PDFKit.PDFDocument, compra: CompraWithDetails) {
        const tableBottom = 250 + (compra.detalles.length * 20) + 50;

        doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text(`TOTAL: Bs ${Number(compra.total).toFixed(2)}`, 400, tableBottom, { align: 'right' });

        doc
            .fontSize(8)
            .font('Helvetica')
            .text('Documento generado automáticamente por el sistema.', 50, 700, { align: 'center', width: 500 });
    }
}
