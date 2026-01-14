import { PartialType } from '@nestjs/mapped-types';
import { CreateClienteDto } from './create-cliente.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { EstadoGenerico } from '@prisma/client';

export class UpdateClienteDto extends PartialType(CreateClienteDto) {
    @IsOptional()
    @IsEnum(EstadoGenerico)
    estado?: EstadoGenerico;
}
