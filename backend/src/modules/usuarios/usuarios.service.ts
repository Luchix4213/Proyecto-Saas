import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { RolUsuario } from '@prisma/client';

@Injectable()
export class UsuariosService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto, tenantId: number, requestingUser?: any) {
        // Restricción: PROPIETARIO solo puede crear VENDEDOR
        if (requestingUser?.rol === RolUsuario.PROPIETARIO) {
            if (createUserDto.rol !== RolUsuario.VENDEDOR) {
                throw new ForbiddenException('Los propietarios solo pueden crear usuarios con rol VENDEDOR.');
            }
        }
        const { password, ...userData } = createUserDto;

        // Validar email único
        const existingUser = await this.prisma.usuario.findUnique({
            where: { email: userData.email },
        });
        if (existingUser) {
            throw new BadRequestException('El email ya está registrado');
        }

        const passwordHash = await bcrypt.hash(password, 10);

        return this.prisma.usuario.create({
            data: {
                ...userData,
                password_hash: passwordHash,
                tenant_id: tenantId,
            },
        });
    }

    async findAll(tenantId: number) {
        return this.prisma.usuario.findMany({
            where: { tenant_id: tenantId },
            select: {
                usuario_id: true,
                nombre: true,
                paterno: true,
                materno: true,
                email: true,
                rol: true,
                estado: true,
                fecha_creacion: true,
            },
        });
    }

    async findOne(id: number, tenantId: number) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { usuario_id: id },
        });

        if (!usuario || usuario.tenant_id !== tenantId) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const { password_hash, ...result } = usuario;
        return result;
    }

    async remove(id: number, tenantId: number) {
        await this.findOne(id, tenantId); // Verificar existencia y pertenencia

        return this.prisma.usuario.delete({
            where: { usuario_id: id },
        });
    }

    async update(id: number, updateUserDto: UpdateUserDto, tenantId: number) {
        await this.findOne(id, tenantId); // Verificar existencia y pertenencia

        return this.prisma.usuario.update({
            where: { usuario_id: id },
            data: updateUserDto,
        });
    }

    async changePassword(id: number, changePasswordDto: ChangePasswordDto, tenantId: number) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { usuario_id: id },
        });

        if (!usuario || usuario.tenant_id !== tenantId) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const isMatch = await bcrypt.compare(changePasswordDto.oldPassword, usuario.password_hash);
        if (!isMatch) {
            throw new UnauthorizedException('La contraseña actual es incorrecta');
        }

        const newHash = await bcrypt.hash(changePasswordDto.newPassword, 10);

        await this.prisma.usuario.update({
            where: { usuario_id: id },
            data: { password_hash: newHash },
        });

        return { message: 'Contraseña actualizada correctamente' };
    }
}
