import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { EstadoGenerico } from '@prisma/client';

@Injectable()
export class ProveedoresService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: number, createProveedorDto: CreateProveedorDto) {
    return await this.prisma.proveedor.create({
      data: {
        ...createProveedorDto,
        tenant_id: tenantId,
        estado: EstadoGenerico.ACTIVO,
      },
    });
  }

  async findAll(tenantId: number) {
    return await this.prisma.proveedor.findMany({
      where: {
        tenant_id: tenantId,
        estado: EstadoGenerico.ACTIVO,
      },
      orderBy: {
        nombre: 'asc',
      },
      include: {
        _count: {
          select: { productos: true },
        },
      },
    });
  }

  async findOne(tenantId: number, id: number) {
    const proveedor = await this.prisma.proveedor.findFirst({
      where: {
        proveedor_id: id,
        tenant_id: tenantId,
        estado: EstadoGenerico.ACTIVO,
      },
    });

    if (!proveedor) {
      throw new NotFoundException(`Proveedor #${id} no encontrado`);
    }

    return proveedor;
  }

  async update(tenantId: number, id: number, updateProveedorDto: UpdateProveedorDto) {
    await this.findOne(tenantId, id); // Verifica existencia y pertenencia

    return await this.prisma.proveedor.update({
      where: { proveedor_id: id },
      data: updateProveedorDto,
    });
  }

  async remove(tenantId: number, id: number) {
    await this.findOne(tenantId, id); // Verifica existencia y pertenencia

    return await this.prisma.proveedor.update({
      where: { proveedor_id: id },
      data: { estado: EstadoGenerico.INACTIVO },
    });
  }
}
