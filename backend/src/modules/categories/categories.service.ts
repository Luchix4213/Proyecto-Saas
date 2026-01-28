import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) { }

  async create(tenantId: number, createCategoryDto: CreateCategoryDto) {
    return this.prisma.categoria.create({
      data: {
        ...createCategoryDto,
        tenant_id: tenantId,
      },
    });
  }

  async findAll(tenantId: number, estado?: string) {
    const whereClause: any = {
      tenant_id: tenantId,
    };

    if (estado) {
      whereClause.estado = estado;
    } else {
      whereClause.estado = 'ACTIVO'; // Default behavior
    }

    return this.prisma.categoria.findMany({
      where: whereClause,
      orderBy: {
        nombre: 'asc',
      }
    });
  }

  async findOne(id: number, tenantId: number) {
    const category = await this.prisma.categoria.findFirst({
      where: {
        categoria_id: id,
        tenant_id: tenantId,
      },
      include: {
        productos: true,
      }
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto, tenantId: number) {
    await this.findOne(id, tenantId); // Verificar propiedad
    return this.prisma.categoria.update({
      where: { categoria_id: id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number, tenantId: number) {
    await this.findOne(id, tenantId); // Verificar propiedad
    return this.prisma.categoria.update({
      where: { categoria_id: id },
      data: { estado: 'INACTIVO' },
    });
  }

  async findPublicBySlug(slugOrId: string) {
    const id = parseInt(slugOrId);
    const isId = !isNaN(id);

    return this.prisma.categoria.findMany({
      where: {
        tenant: {
          OR: [
            { slug: slugOrId },
            ...(isId ? [{ tenant_id: id }] : [])
          ]
        },
        estado: 'ACTIVO',
      },
      orderBy: {
        nombre: 'asc',
      }
    });
  }
}
