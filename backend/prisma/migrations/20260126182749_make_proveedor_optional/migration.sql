-- DropForeignKey
ALTER TABLE "Compra" DROP CONSTRAINT "Compra_proveedor_id_fkey";

-- AlterTable
ALTER TABLE "Compra" ALTER COLUMN "proveedor_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "Proveedor"("proveedor_id") ON DELETE SET NULL ON UPDATE CASCADE;
