import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RubrosService } from './rubros.service';
import { CreateRubroDto } from './dto/create-rubro.dto';
import { UpdateRubroDto } from './dto/update-rubro.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';

@Controller('rubros')
export class RubrosController {
  constructor(private readonly rubrosService: RubrosService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  create(@Body() createRubroDto: CreateRubroDto) {
    return this.rubrosService.create(createRubroDto);
  }

  @Get()
  findAll() {
    return this.rubrosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rubrosService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  update(@Param('id') id: string, @Body() updateRubroDto: UpdateRubroDto) {
    return this.rubrosService.update(+id, updateRubroDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  remove(@Param('id') id: string) {
    return this.rubrosService.remove(+id);
  }
}
