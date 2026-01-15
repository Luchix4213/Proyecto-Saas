import { IsInt, IsEnum, IsOptional, IsNumber, IsDateString, IsString } from 'class-validator';
import { EstadoSuscripcion, MetodoPago } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateSuscripcionDto {
  @IsInt()
  @Type(() => Number)
  tenant_id: number;

  @IsInt()
  @Type(() => Number)
  plan_id: number;

  @IsDateString()
  fecha_inicio: string; // ISO Date

  @IsString()
  @IsEnum(['MENSUAL', 'ANUAL'])
  ciclo: 'MENSUAL' | 'ANUAL';

  @IsOptional()
  @IsDateString()
  fecha_fin?: string; // Calculated by backend now

  @IsOptional()
  @IsNumber()
  monto?: number; // Calculated by backend now

  @IsEnum(MetodoPago)
  metodo_pago: string; // 'TARJETA', 'TRANSFERENCIA', etc.

  @IsOptional()
  @IsEnum(EstadoSuscripcion)
  estado?: EstadoSuscripcion;

  @IsOptional()
  @IsString()
  referencia?: string;

  @IsOptional()
  @IsString()
  comprobante_url?: string;
}
