/*
  Warnings:

  - You are about to drop the column `rubro` on the `Tenant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenant_id,slug]` on the table `Producto` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenant_id` to the `Categoria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `Proveedor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Venta" DROP CONSTRAINT "Venta_usuario_id_fkey";

-- AlterTable
ALTER TABLE "Categoria" ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "tenant_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Compra" ADD COLUMN     "metodo_pago" "MetodoPago" NOT NULL DEFAULT 'EFECTIVO';

-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "destacado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "Proveedor" ADD COLUMN     "tenant_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "rubro",
ADD COLUMN     "banner_url" TEXT,
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "Venta" ADD COLUMN     "comprobante_pago" TEXT,
ALTER COLUMN "usuario_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Rubro" (
    "rubro_id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoGenerico" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Rubro_pkey" PRIMARY KEY ("rubro_id")
);

-- CreateTable
CREATE TABLE "_RubroToTenant" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RubroToTenant_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rubro_nombre_key" ON "Rubro"("nombre");

-- CreateIndex
CREATE INDEX "_RubroToTenant_B_index" ON "_RubroToTenant"("B");

-- CreateIndex
CREATE INDEX "Categoria_tenant_id_idx" ON "Categoria"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_tenant_id_slug_key" ON "Producto"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "Proveedor_tenant_id_idx" ON "Proveedor"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proveedor" ADD CONSTRAINT "Proveedor_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RubroToTenant" ADD CONSTRAINT "_RubroToTenant_A_fkey" FOREIGN KEY ("A") REFERENCES "Rubro"("rubro_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RubroToTenant" ADD CONSTRAINT "_RubroToTenant_B_fkey" FOREIGN KEY ("B") REFERENCES "Tenant"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;
