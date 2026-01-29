-- CreateEnum
CREATE TYPE "TipoEntrega" AS ENUM ('RECOJO', 'DELIVERY');

-- AlterTable
ALTER TABLE "Venta" ADD COLUMN     "latitud" DECIMAL(10,8),
ADD COLUMN     "longitud" DECIMAL(11,8),
ADD COLUMN     "tipo_entrega" "TipoEntrega" NOT NULL DEFAULT 'RECOJO';
