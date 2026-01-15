-- AlterEnum
ALTER TYPE "EstadoSuscripcion" ADD VALUE 'PENDIENTE';

-- AlterTable
ALTER TABLE "Suscripcion" ADD COLUMN     "comprobante_url" TEXT;
