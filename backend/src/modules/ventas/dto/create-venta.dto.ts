import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, ValidateNested } from 'class-validator';
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
  qr_pago?: string;
}
