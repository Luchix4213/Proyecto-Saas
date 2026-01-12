-- CreateEnum
CREATE TYPE "EstadoEmpresa" AS ENUM ('PENDIENTE', 'ACTIVA', 'INACTIVA');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'PROPIETARIO', 'VENDEDOR');

-- CreateEnum
CREATE TYPE "EstadoGenerico" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "TipoVenta" AS ENUM ('FISICA', 'ONLINE');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'QR', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "EstadoEntrega" AS ENUM ('PENDIENTE', 'EN_CAMINO', 'ENTREGADO');

-- CreateEnum
CREATE TYPE "EstadoVenta" AS ENUM ('REGISTRADA', 'PAGADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoCompra" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "Plan" (
    "plan_id" SERIAL NOT NULL,
    "nombre_plan" TEXT NOT NULL,
    "max_usuarios" INTEGER NOT NULL,
    "max_productos" INTEGER NOT NULL,
    "ventas_online" BOOLEAN NOT NULL DEFAULT false,
    "reportes_avanzados" BOOLEAN NOT NULL DEFAULT false,
    "precio" DECIMAL(10,2) NOT NULL,
    "estado" "EstadoGenerico" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("plan_id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "tenant_id" SERIAL NOT NULL,
    "nombre_empresa" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT NOT NULL,
    "direccion" TEXT,
    "moneda" TEXT NOT NULL DEFAULT 'BOB',
    "impuesto_porcentaje" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "logo_url" TEXT,
    "horario_atencion" TEXT,
    "estado" "EstadoEmpresa" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plan_id" INTEGER NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("tenant_id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "usuario_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "paterno" TEXT,
    "materno" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "estado" "EstadoGenerico" NOT NULL DEFAULT 'ACTIVO',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reset_token" TEXT,
    "reset_token_exp" TIMESTAMP(3),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "cliente_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "paterno" TEXT,
    "materno" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "password_hash" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoGenerico" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("cliente_id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "categoria_id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "estado" "EstadoGenerico" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("categoria_id")
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "proveedor_id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "datos_pago" TEXT,
    "estado" "EstadoGenerico" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("proveedor_id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "producto_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "proveedor_id" INTEGER,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "stock_actual" INTEGER NOT NULL DEFAULT 0,
    "stock_minimo" INTEGER NOT NULL DEFAULT 5,
    "estado" "EstadoGenerico" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("producto_id")
);

-- CreateTable
CREATE TABLE "Compra" (
    "compra_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "proveedor_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "fecha_compra" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL(10,2) NOT NULL,
    "estado" "EstadoCompra" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "Compra_pkey" PRIMARY KEY ("compra_id")
);

-- CreateTable
CREATE TABLE "DetalleCompra" (
    "detalle_compra_id" SERIAL NOT NULL,
    "compra_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "DetalleCompra_pkey" PRIMARY KEY ("detalle_compra_id")
);

-- CreateTable
CREATE TABLE "Venta" (
    "venta_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "cliente_id" INTEGER,
    "usuario_id" INTEGER NOT NULL,
    "fecha_venta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL(10,2) NOT NULL,
    "tipo_venta" "TipoVenta" NOT NULL DEFAULT 'FISICA',
    "metodo_pago" "MetodoPago" NOT NULL DEFAULT 'EFECTIVO',
    "estado_entrega" "EstadoEntrega" NOT NULL DEFAULT 'PENDIENTE',
    "qr_pago" TEXT,
    "comprobante_pdf" TEXT,
    "estado" "EstadoVenta" NOT NULL DEFAULT 'REGISTRADA',

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("venta_id")
);

-- CreateTable
CREATE TABLE "DetalleVenta" (
    "detalle_venta_id" SERIAL NOT NULL,
    "venta_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "DetalleVenta_pkey" PRIMARY KEY ("detalle_venta_id")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "notificacion_id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "fecha_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leida" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("notificacion_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_nombre_plan_key" ON "Plan"("nombre_plan");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_email_key" ON "Tenant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_tenant_id_idx" ON "Usuario"("tenant_id");

-- CreateIndex
CREATE INDEX "Cliente_tenant_id_idx" ON "Cliente"("tenant_id");

-- CreateIndex
CREATE INDEX "Producto_tenant_id_idx" ON "Producto"("tenant_id");

-- CreateIndex
CREATE INDEX "Compra_tenant_id_idx" ON "Compra"("tenant_id");

-- CreateIndex
CREATE INDEX "Venta_tenant_id_idx" ON "Venta"("tenant_id");

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "Plan"("plan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "Categoria"("categoria_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "Proveedor"("proveedor_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "Proveedor"("proveedor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleCompra" ADD CONSTRAINT "DetalleCompra_compra_id_fkey" FOREIGN KEY ("compra_id") REFERENCES "Compra"("compra_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleCompra" ADD CONSTRAINT "DetalleCompra_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "Producto"("producto_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("cliente_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleVenta" ADD CONSTRAINT "DetalleVenta_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "Venta"("venta_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleVenta" ADD CONSTRAINT "DetalleVenta_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "Producto"("producto_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;
