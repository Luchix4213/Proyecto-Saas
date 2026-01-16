import { Injectable } from '@nestjs/common';
import { CreateRubroDto } from './dto/create-rubro.dto';
import { UpdateRubroDto } from './dto/update-rubro.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RubrosService {
  constructor(private prisma: PrismaService) {}

  create(createRubroDto: CreateRubroDto) {
    return this.prisma.rubro.create({
      data: createRubroDto,
    });
  }

  findAll() {
    return this.prisma.rubro.findMany({
      where: { estado: 'ACTIVO' },
    });
  }

  findOne(id: number) {
    return this.prisma.rubro.findUnique({
      where: { rubro_id: id },
    });
  }

  update(id: number, updateRubroDto: UpdateRubroDto) {
    return this.prisma.rubro.update({
      where: { rubro_id: id },
      data: updateRubroDto,
    });
  }

  remove(id: number) {
    return this.prisma.rubro.update({
      where: { rubro_id: id },
      data: { estado: 'INACTIVO' }, // Soft delete
    });
  }
}
