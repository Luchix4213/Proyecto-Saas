import { IsEmail, IsEnum, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MetodoPago, TipoEntrega } from '@prisma/client';

class CheckoutItemDto {
  @IsNumber()
  @IsNotEmpty()
  producto_id: number;

  @IsNumber()
  @IsNotEmpty()
  cantidad: number;

  @IsNumber()
  @IsOptional()
  descuento?: number;
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
  @IsString()
  @IsOptional()
  nit_ci?: string;

  @IsOptional()
  @IsString()
  nit_facturacion?: string;

  @IsOptional()
  @IsString()
  razon_social?: string;

  @IsOptional()
  @IsString()
  direccion_envio?: string;

  @IsOptional()
  @IsString()
  ubicacion_maps?: string;

  @IsOptional()
  @IsNumber()
  costo_envio?: number;


  @IsString()
  @IsOptional()
  paterno?: string;

  @IsString()
  @IsOptional()
  materno?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

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

  @IsOptional()
  @IsEnum(TipoEntrega)
  tipo_entrega?: TipoEntrega;

  @IsOptional()
  @IsNumber()
  latitud?: number;

  @IsOptional()
  @IsNumber()
  longitud?: number;
}
