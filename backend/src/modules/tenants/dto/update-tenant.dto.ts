import { IsString, IsOptional, IsEmail, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoEmpresa } from '@prisma/client';

export class UpdateTenantDto {
    @IsOptional()
    @IsString()
    nombre_empresa?: string;

    @IsOptional()
    @IsString()
    telefono?: string;

    @IsOptional()
    @IsString()
    direccion?: string;

    @IsOptional()
    @IsString()
    moneda?: string;

    @IsOptional()
    @IsString() // Se recibe como string de la subida de imagen, pero se guarda como URL
    logo_url?: string;

    @IsOptional()
    @IsString()
    horario_atencion?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    impuesto_porcentaje?: number;

    // El estado solo lo puede cambiar el SuperAdmin, pero lo incluimos aquí
    // y lo validaremos en el controlador o servicio según rol.
    @IsOptional()
    @IsEnum(EstadoEmpresa)
    estado?: EstadoEmpresa;
}
