import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateProductoDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsNumber()
    @IsNotEmpty()
    precio: number;

    @IsNumber()
    @IsNotEmpty()
    categoria_id: number;

    @IsNumber()
    @IsOptional()
    proveedor_id?: number;

    @IsNumber()
    @IsOptional()
    stock_actual?: number;

    @IsNumber()
    @IsOptional()
    stock_minimo?: number;
}
