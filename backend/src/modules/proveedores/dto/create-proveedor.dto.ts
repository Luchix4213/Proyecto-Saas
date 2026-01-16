import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProveedorDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsOptional()
    @IsString()
    telefono?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    datos_pago?: string;
}
