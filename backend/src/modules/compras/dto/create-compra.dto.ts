import { IsArray, IsInt, IsNotEmpty, IsPositive, ValidateNested, IsNumber } from 'class-validator';
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
}

export class CreateCompraDto {
  @IsInt()
  @IsNotEmpty()
  proveedor_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleCompraItemDto)
  productos: DetalleCompraItemDto[];
}
