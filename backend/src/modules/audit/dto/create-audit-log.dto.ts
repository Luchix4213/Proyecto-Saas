import { IsOptional, IsString, IsInt, IsObject, IsNotEmpty } from 'class-validator';

export class CreateAuditLogDto {
  @IsOptional()
  @IsInt()
  tenant_id?: number;

  @IsOptional()
  @IsInt()
  usuario_id?: number;

  @IsString()
  @IsNotEmpty()
  modulo: string;

  @IsString()
  @IsNotEmpty()
  accion: string;

  @IsString()
  @IsNotEmpty()
  detalle: string;

  @IsOptional()
  @IsObject()
  metadata?: any;

  @IsOptional()
  @IsString()
  ip_address?: string;
}
