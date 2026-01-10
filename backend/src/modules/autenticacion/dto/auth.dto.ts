import { IsEmail, IsNotEmpty, MinLength, IsString, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;
}

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
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;
}
