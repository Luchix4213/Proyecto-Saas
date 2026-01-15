import { Controller, Patch, Param, Body, UseGuards, ParseIntPipe, Get, Request, UnauthorizedException, ForbiddenException, ParseEnumPipe, Post, UseInterceptors, UploadedFile, BadRequestException, Query } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { EstadoEmpresa, RolUsuario } from '@prisma/client';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from '../../common/utils/file-upload.utils';

@Controller('tenants')
@UseGuards(AuthGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) { }

  @Post()
  async create(@Body() createTenantDto: CreateTenantDto, @Request() req) {
    if (req.user.rol !== RolUsuario.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden crear empresas.');
    }
    return this.tenantsService.create(createTenantDto);
  }

  @Get('me')
  async findMyTenant(@Request() req) {
    // Si es admin, no tiene tenant_id asugando de la misma forma, o quizas si.
    // Asumimos uso para Propietarios/Usuarios
    if (!req.user.tenant_id) {
      throw new ForbiddenException('No tienes un tenant asignado.');
    }
    return this.tenantsService.findOne(req.user.tenant_id);
  }

  @Get()
  async findAll(@Request() req, @Query('rubro') rubro?: string) {
    if (req.user.rol !== RolUsuario.ADMIN) {
      throw new ForbiddenException('Acceso denegado. Solo administradores.');
    }
    return this.tenantsService.findAll(rubro);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    // Si es admin puede ver cualquiera. Si es propietario solo el suyo.
    if (req.user.rol !== RolUsuario.ADMIN && req.user.tenant_id !== id) {
      throw new ForbiddenException('No tienes permiso para ver este tenant.');
    }
    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/tenants',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTenantDto: UpdateTenantDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    // 1. Validar permisos: ADMIN o PROPIETARIO del mismo tenant
    if (req.user.rol !== RolUsuario.ADMIN) {
      if (req.user.rol !== RolUsuario.PROPIETARIO || req.user.tenant_id !== id) {
        throw new ForbiddenException('No tienes permiso para modificar este tenant.');
      }
    }

    // 2. Si hay archivo, agregar url al DTO
    if (file) {
      // Guardamos ruta relativa
      updateTenantDto.logo_url = `/uploads/tenants/${file.filename}`;
    }

    // 3. Si el usuario intenta cambiar 'estado' y no es ADMIN, lo ignoramos o lanzamos error
    if (updateTenantDto.estado && req.user.rol !== RolUsuario.ADMIN) {
      delete updateTenantDto.estado; // Silently ignorar o throw Forbidden
    }

    return this.tenantsService.update(id, updateTenantDto);
  }

  @Patch(':id/plan')
  async updatePlan(
    @Param('id', ParseIntPipe) id: number,
    @Body('plan') plan: string,
    @Request() req
  ) {
    // Validar permisos
    if (req.user.rol !== RolUsuario.ADMIN) {
      // Si no es admin, debe ser PROPIETARIO y el ID debe coincidir
      if (req.user.rol !== RolUsuario.PROPIETARIO || req.user.tenant_id !== id) {
        throw new ForbiddenException('No tienes permiso para modificar este tenant.');
      }
    }
    return this.tenantsService.updatePlan(id, plan);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: EstadoEmpresa,
    @Request() req,
  ) {
    if (req.user.rol !== RolUsuario.ADMIN) {
      throw new ForbiddenException('Acceso denegado. Solo administradores.');
    }
    return this.tenantsService.updateStatus(id, estado);
  }
}
