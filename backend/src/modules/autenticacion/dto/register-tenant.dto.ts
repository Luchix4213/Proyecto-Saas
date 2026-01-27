import { IsEmail, IsNotEmpty, MinLength, IsString, IsOptional, IsNumber, Matches } from 'class-validator';

export class RegisterTenantDto {
    // Datos Empresa
    @IsNotEmpty()
    @IsString()
    nombre_empresa: string;

    @IsOptional()
    @IsString()
    telefono_empresa?: string;

    @IsOptional()
    @IsString()
    direccion_empresa?: string;

    @IsEmail()
    email_empresa: string;

    @IsOptional()
    @IsNumber({}, { each: true })
    rubros?: number[];

    // Datos Admin
    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsNotEmpty()
    @IsString()
    paterno: string;

    @IsOptional()
    @IsString()
    materno?: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
    })
    password: string;
}
