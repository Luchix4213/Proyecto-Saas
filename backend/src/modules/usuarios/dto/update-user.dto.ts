import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { EstadoGenerico } from '@prisma/client';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsOptional()
    @IsEnum(EstadoGenerico)
    estado?: EstadoGenerico;
}
