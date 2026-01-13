import { IsInt, IsEnum, IsOptional, IsNumber, IsDateString, IsString } from 'class-validator';
import { EstadoSuscripcion, MetodoPago } from '@prisma/client';

export class CreateSuscripcionDto {
  @IsInt()
  tenant_id: number;

  @IsInt()
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
}
