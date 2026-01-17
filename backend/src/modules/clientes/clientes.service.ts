import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { EstadoGenerico } from '@prisma/client';

@Injectable()
export class ClientesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createClienteDto: CreateClienteDto, tenantId: number) {
        // Verificar si ya existe un cliente con el mismo email o nit_ci EN ESTE TENANT
        // (Opcional, dependiendo de cuán estricto queramos ser. Por ahora permitimos duplicados de nombre pero no de email si se provee)

        // Crear cliente
        return this.prisma.cliente.create({
            data: {
                ...createClienteDto,
                tenant_id: tenantId,
            },
        });
    }

    async findAll(tenantId: number) {
        return this.prisma.cliente.findMany({
            where: {
                tenant_id: tenantId,
                // Removed default filter to allow frontend filtering
            },
            orderBy: { fecha_registro: 'desc' },
        });
    }

    async findOne(id: number, tenantId: number) {
        const cliente = await this.prisma.cliente.findUnique({
            where: { cliente_id: id },
        });

        if (!cliente || cliente.tenant_id !== tenantId) {
            throw new NotFoundException(`Cliente con ID ${id} no encontrado.`);
        }

        return cliente;
    }

    async update(id: number, updateClienteDto: UpdateClienteDto, tenantId: number) {
        await this.findOne(id, tenantId); // Verificar existencia y pertenencia

        return this.prisma.cliente.update({
            where: { cliente_id: id },
            data: updateClienteDto,
        });
    }

    async remove(id: number, tenantId: number) {
        await this.findOne(id, tenantId);

        // Soft Delete
        return this.prisma.cliente.update({
            where: { cliente_id: id },
            data: { estado: EstadoGenerico.INACTIVO },
        });
    }
}
