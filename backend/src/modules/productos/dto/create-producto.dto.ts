import { IsString, IsNumber, IsOptional, IsNotEmpty, IsBoolean, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductoDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    precio: number;

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    categoria_id: number;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    proveedor_id?: number;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(0)
    stock_actual?: number;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(0)
    stock_minimo?: number;

    @IsOptional()
    @IsBoolean()
    destacado?: boolean;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsOptional()
    @IsString()
    estado?: 'ACTIVO' | 'INACTIVO';
}
