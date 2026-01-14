import { IsString, IsNotEmpty, IsOptional, IsEmail, Matches } from 'class-validator';

export class CreateClienteDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsOptional()
    paterno?: string;

    @IsString()
    @IsOptional()
    materno?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    telefono?: string;

    @IsString()
    @IsOptional()
    nit_ci?: string;
}
