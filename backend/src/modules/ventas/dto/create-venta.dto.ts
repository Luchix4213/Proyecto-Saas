import { IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MetodoPago, TipoVenta } from '@prisma/client';

class DetalleVentaItemDto {
  @IsInt()
  @IsPositive()
  producto_id: number;

  @IsInt()
  @IsPositive()
  cantidad: number;
}

export class CreateVentaDto {
  @IsOptional()
  @IsInt()
  cliente_id?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleVentaItemDto)
  productos: DetalleVentaItemDto[];

  @IsNotEmpty()
  @IsEnum(TipoVenta)
  tipo_venta: TipoVenta;

  @IsNotEmpty()
  @IsEnum(MetodoPago)
  metodo_pago: MetodoPago;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  monto_recibido?: number;

  @IsOptional()
  @IsString()
  nit_facturacion?: string;

  @IsOptional()
  @IsString()
  razon_social?: string;

  @IsOptional()
  qr_pago?: string;
}
