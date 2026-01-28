import { Controller, Patch, Param, Body, UseGuards, ParseIntPipe, Get, Request, UnauthorizedException, ForbiddenException, ParseEnumPipe, Post, UseInterceptors, UploadedFile, BadRequestException, Query, UploadedFiles } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { EstadoEmpresa, RolUsuario } from '@prisma/client';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from '../../common/utils/file-upload.utils';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) { }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() createTenantDto: CreateTenantDto, @Request() req) {
    if (req.user.rol !== RolUsuario.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden crear empresas.');
    }
    return this.tenantsService.create(createTenantDto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async findMyTenant(@Request() req) {
    // Si es admin, no tiene tenant_id asugando de la misma forma, o quizas si.
    // Asumimos uso para Propietarios/Usuarios
    if (!req.user.tenant_id) {
      throw new ForbiddenException('No tienes un tenant asignado.');
    }
    return this.tenantsService.findOne(req.user.tenant_id);
  }

  @Get('marketplace')
  async findAllPublic(@Query('rubro') rubro?: string) {
    return this.tenantsService.findAllPublic(rubro);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Request() req, @Query('rubro') rubro?: string) {
    if (req.user.rol !== RolUsuario.ADMIN) {
      throw new ForbiddenException('Acceso denegado. Solo administradores.');
    }
    return this.tenantsService.findAll(rubro);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
      const tenant = await this.tenantsService.findPublic(slug);
      if (!tenant) {
          throw new BadRequestException('Tienda no encontrada o inactiva');
      }
      return tenant;
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    // Si es admin puede ver cualquiera. Si es propietario solo el suyo.
    if (req.user.rol !== RolUsuario.ADMIN && req.user.tenant_id !== id) {
      throw new ForbiddenException('No tienes permiso para ver este tenant.');
    }
    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
        { name: 'logo', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
        { name: 'qr_pago', maxCount: 1 }
    ], {
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
    @UploadedFiles() files: { logo?: Express.Multer.File[], banner?: Express.Multer.File[], qr_pago?: Express.Multer.File[] },
    @Request() req
  ) {
    // 1. Validar permisos: ADMIN o PROPIETARIO del mismo tenant
    if (req.user.rol !== RolUsuario.ADMIN) {
      if (req.user.rol !== RolUsuario.PROPIETARIO || req.user.tenant_id !== id) {
        throw new ForbiddenException('No tienes permiso para modificar este tenant.');
      }
    }

    // 2. Si hay archivo logo
    if (files?.logo && files.logo.length > 0) {
      updateTenantDto.logo_url = `/uploads/tenants/${files.logo[0].filename}`;
    }

    // 3. Si hay archivo banner
    if (files?.banner && files.banner.length > 0) {
      updateTenantDto.banner_url = `/uploads/tenants/${files.banner[0].filename}`;
    }

    // 4. Si hay archivo QR
    if (files?.qr_pago && files.qr_pago.length > 0) {
      updateTenantDto.qr_pago_url = `/uploads/tenants/${files.qr_pago[0].filename}`;
    }

    // 4. Si el usuario intenta cambiar 'estado' y no es ADMIN, lo ignoramos o lanzamos error
    if (updateTenantDto.estado && req.user.rol !== RolUsuario.ADMIN) {
      delete updateTenantDto.estado;
    }

    return this.tenantsService.update(id, updateTenantDto);
  }

  @Patch(':id/plan')
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
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
