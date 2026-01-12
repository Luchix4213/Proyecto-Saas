import { IsString, IsInt, IsNumber, IsBoolean, IsOptional, Min, IsEnum } from 'class-validator';
import { EstadoGenerico } from '@prisma/client';

export class CreatePlanDto {
  @IsString()
  nombre_plan: string;

  @IsInt()
  @Min(1)
  max_usuarios: number;

  @IsInt()
  @Min(0)
  max_productos: number;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsBoolean()
  @IsOptional()
  ventas_online?: boolean;

  @IsBoolean()
  @IsOptional()
  reportes_avanzados?: boolean;

  @IsEnum(EstadoGenerico)
  @IsOptional()
  estado?: EstadoGenerico;
}

export class UpdatePlanDto {
  @IsString()
  @IsOptional()
  nombre_plan?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  max_usuarios?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  max_productos?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  precio?: number;

  @IsBoolean()
  @IsOptional()
  ventas_online?: boolean;

  @IsBoolean()
  @IsOptional()
  reportes_avanzados?: boolean;

  @IsEnum(EstadoGenerico)
  @IsOptional()
  estado?: EstadoGenerico;
}
