import { IsEmail, IsEnum, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MetodoPago } from '@prisma/client';

class CheckoutItemDto {
  @IsNumber()
  @IsNotEmpty()
  producto_id: number;

  @IsNumber()
  @IsNotEmpty()
  cantidad: number;
}

export class CheckoutDto {
  // Client info (required if guest, ignored if logged in)
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  nit_ci?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  @IsNotEmpty()
  productos: CheckoutItemDto[];

  @IsEnum(MetodoPago)
  @IsNotEmpty()
  metodo_pago: MetodoPago;

  @IsString()
  @IsOptional()
  comprobante_pago?: string;
}
