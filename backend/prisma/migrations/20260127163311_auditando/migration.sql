-- CreateEnum
CREATE TYPE "EstadoFacturacion" AS ENUM ('PENDIENTE', 'EMITIDA', 'ANULADA');

-- AlterTable
ALTER TABLE "Compra" ADD COLUMN     "comprobante_url" TEXT,
ADD COLUMN     "nro_factura" TEXT,
ADD COLUMN     "observaciones" TEXT;

-- AlterTable
ALTER TABLE "DetalleVenta" ADD COLUMN     "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Venta" ADD COLUMN     "cambio" DECIMAL(10,2),
ADD COLUMN     "codigo_seguimiento" TEXT,
ADD COLUMN     "costo_envio" DECIMAL(10,2),
ADD COLUMN     "courier" TEXT,
ADD COLUMN     "direccion_envio" TEXT,
ADD COLUMN     "estado_facturacion" "EstadoFacturacion" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "fecha_despacho" TIMESTAMP(3),
ADD COLUMN     "fecha_entrega" TIMESTAMP(3),
ADD COLUMN     "fecha_pago" TIMESTAMP(3),
ADD COLUMN     "monto_recibido" DECIMAL(10,2),
ADD COLUMN     "nit_facturacion" TEXT,
ADD COLUMN     "nro_factura" TEXT,
ADD COLUMN     "observaciones" TEXT,
ADD COLUMN     "razon_social" TEXT,
ADD COLUMN     "total_descuento" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "transaccion_id" TEXT,
ADD COLUMN     "ubicacion_maps" TEXT,
ADD COLUMN     "usuario_venta_id" INTEGER;

-- CreateTable
CREATE TABLE "AuditLog" (
    "log_id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "usuario_id" INTEGER,
    "modulo" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "detalle" TEXT NOT NULL,
    "metadata" JSONB,
    "ip_address" TEXT,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE INDEX "AuditLog_tenant_id_idx" ON "AuditLog"("tenant_id");

-- CreateIndex
CREATE INDEX "AuditLog_usuario_id_idx" ON "AuditLog"("usuario_id");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;
