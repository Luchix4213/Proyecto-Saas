import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    nombre?: string;

    @IsOptional()
    @IsString()
    paterno?: string;

    @IsOptional()
    @IsString()
    materno?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password?: string;
}
