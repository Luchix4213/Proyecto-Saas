import { IsArray, IsInt, IsNotEmpty, IsPositive, ValidateNested, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class DetalleCompraItemDto {
  @IsInt()
  @IsPositive()
  producto_id: number;

  @IsInt()
  @IsPositive()
  cantidad: number;

  @IsNumber()
  @IsPositive()
  costo_unitario: number;

  @IsOptional()
  @IsString()
  lote?: string;

  @IsOptional()
  @IsString()
  fecha_vencimiento?: string;
}

export class CreateCompraDto {
  @IsInt()
  @IsOptional()
  proveedor_id?: number;

  @IsNotEmpty()
  metodo_pago: 'EFECTIVO' | 'QR' | 'TRANSFERENCIA';

  @IsOptional()
  @IsString()
  nro_factura?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleCompraItemDto)
  productos: DetalleCompraItemDto[];
}
