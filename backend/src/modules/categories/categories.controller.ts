import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('categories')
@UseGuards(AuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @Req() req) {
    return this.categoriesService.create(req.user.tenant_id, createCategoryDto);
  }

  @Get()
  findAll(@Req() req) {
    return this.categoriesService.findAll(req.user.tenant_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.categoriesService.findOne(+id, req.user.tenant_id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @Req() req) {
    return this.categoriesService.update(+id, updateCategoryDto, req.user.tenant_id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.categoriesService.remove(+id, req.user.tenant_id);
  }
}
