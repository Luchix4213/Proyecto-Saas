import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { PlanNombre } from '@prisma/client';

export class CreateTenantDto {
    @IsNotEmpty()
    @IsString()
    nombre_empresa: string;

    @IsOptional()
    @IsString()
    telefono?: string;

    @IsEmail()
    @IsEmail()
    @IsNotEmpty()
    email: string; // Email del admin inicial

    @IsEmail()
    @IsOptional()
    email_empresa?: string; // Email de la empresa

    @IsOptional()
    @IsString()
    direccion?: string;

    @IsOptional()
    @IsString()
    moneda?: string = 'BOB';

    @IsOptional()
    @IsNumber()
    impuesto_porcentaje?: number = 0;

    @IsEnum(PlanNombre)
    @IsOptional()
    plan?: PlanNombre = PlanNombre.FREE;

    @IsOptional()
    @IsString()
    horario_atencion?: string;

    // Datos del usuario admin inicial
    @IsString()
    @IsNotEmpty()
    nombre_contacto: string;

    @IsString()
    @IsNotEmpty()
    paterno_contacto: string;

    @IsString()
    @IsNotEmpty()
    password_contacto: string;
}
