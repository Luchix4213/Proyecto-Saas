import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { RolUsuario } from '@prisma/client';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    nombre: string;

    @IsOptional()
    @IsString()
    paterno?: string;

    @IsOptional()
    @IsString()
    materno?: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsEnum(RolUsuario)
    @IsNotEmpty()
    rol: RolUsuario;
}
