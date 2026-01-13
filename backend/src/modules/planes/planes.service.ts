import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlanDto, UpdatePlanDto } from './dto/create-plan.dto';

@Injectable()
export class PlanesService {
  constructor(private prisma: PrismaService) {}

  async create(createPlanDto: CreatePlanDto) {
    try {
      return await this.prisma.plan.create({
        data: {
          nombre_plan: createPlanDto.nombre_plan,
          descripcion: createPlanDto.descripcion,
          max_usuarios: createPlanDto.max_usuarios,
          max_productos: createPlanDto.max_productos,
          precio_mensual: createPlanDto.precio_mensual,
          precio_anual: createPlanDto.precio_anual,
          ventas_online: createPlanDto.ventas_online || false,
          reportes_avanzados: createPlanDto.reportes_avanzados || false,
          estado: createPlanDto.estado,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('El nombre del plan ya existe.');
      }
      console.error('Error creating plan:', error);
      throw new InternalServerErrorException('Error al crear el plan');
    }
  }

  async findAll() {
    return this.prisma.plan.findMany({
      orderBy: { precio_mensual: 'asc' },
    });
  }

  async findOne(id: number) {
    const plan = await this.prisma.plan.findUnique({
      where: { plan_id: id },
    });
    if (!plan) throw new NotFoundException('Plan no encontrado');
    return plan;
  }

  async update(id: number, updatePlanDto: UpdatePlanDto) {
    // Verificar si existe
    await this.findOne(id);
    return this.prisma.plan.update({
      where: { plan_id: id },
      data: updatePlanDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    // Podrias chequear si hay tenants usando este plan antes de borrar
    return this.prisma.plan.delete({
      where: { plan_id: id },
    });
  }
}
