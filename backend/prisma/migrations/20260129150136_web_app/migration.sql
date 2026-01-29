/*
  Warnings:

  - You are about to drop the column `codigo_seguimiento` on the `Venta` table. All the data in the column will be lost.
  - You are about to drop the column `courier` on the `Venta` table. All the data in the column will be lost.
  - You are about to drop the column `estado_facturacion` on the `Venta` table. All the data in the column will be lost.
  - You are about to drop the column `nit_facturacion` on the `Venta` table. All the data in the column will be lost.
  - You are about to drop the column `nro_factura` on the `Venta` table. All the data in the column will be lost.
  - You are about to drop the column `observaciones` on the `Venta` table. All the data in the column will be lost.
  - You are about to drop the column `qr_pago` on the `Venta` table. All the data in the column will be lost.
  - You are about to drop the column `razon_social` on the `Venta` table. All the data in the column will be lost.
  - You are about to drop the column `transaccion_id` on the `Venta` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token_confirmacion]` on the table `Venta` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EstadoConfirmacion" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'RECLAMO', 'SIN_RESPUESTA');

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "latitud" DECIMAL(10,8),
ADD COLUMN     "longitud" DECIMAL(11,8),
ADD COLUMN     "qr_pago_url" TEXT;

-- AlterTable
ALTER TABLE "Venta" DROP COLUMN "codigo_seguimiento",
DROP COLUMN "courier",
DROP COLUMN "estado_facturacion",
DROP COLUMN "nit_facturacion",
DROP COLUMN "nro_factura",
DROP COLUMN "observaciones",
DROP COLUMN "qr_pago",
DROP COLUMN "razon_social",
DROP COLUMN "transaccion_id",
ADD COLUMN     "comentario_confirmacion" TEXT,
ADD COLUMN     "estado_confirmacion" "EstadoConfirmacion" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "expiracion_confirmacion" TIMESTAMP(3),
ADD COLUMN     "fecha_confirmacion" TIMESTAMP(3),
ADD COLUMN     "token_confirmacion" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Venta_token_confirmacion_key" ON "Venta"("token_confirmacion");
