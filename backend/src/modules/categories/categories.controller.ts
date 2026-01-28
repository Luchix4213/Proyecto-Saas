import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Get('public/:slug')
  findPublic(@Param('slug') slug: string) {
    return this.categoriesService.findPublicBySlug(slug);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createCategoryDto: CreateCategoryDto, @Req() req) {
    return this.categoriesService.create(req.user.tenant_id, createCategoryDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Req() req, @Query('estado') estado?: string) {
    return this.categoriesService.findAll(req.user.tenant_id, estado);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string, @Req() req) {
    return this.categoriesService.findOne(+id, req.user.tenant_id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @Req() req) {
    return this.categoriesService.update(+id, updateCategoryDto, req.user.tenant_id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Req() req) {
    return this.categoriesService.remove(+id, req.user.tenant_id);
  }
}
