import { IsString, IsInt, IsNumber, IsBoolean, IsOptional, Min, IsEnum } from 'class-validator';
import { EstadoGenerico, PlanNombre } from '@prisma/client';

export class CreatePlanDto {
  @IsEnum(PlanNombre)
  nombre_plan: PlanNombre;

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
  @IsEnum(PlanNombre)
  @IsOptional()
  nombre_plan?: PlanNombre;

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
