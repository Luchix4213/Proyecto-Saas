import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, UseGuards, Request, Delete } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('usuarios')
@UseGuards(AuthGuard)
export class UsuariosController {
    constructor(private readonly usuariosService: UsuariosService) { }

    // Helper temporal para obtener tenantId (en fturo vendrá del JWT/Guard)
    private getTenantId(req: any): number {
        // TODO: Eliminar hardcode cuando AuthModule est listo
        return req.user?.tenant_id || 1;
    }

    @Post()
    create(@Body() createUserDto: CreateUserDto, @Request() req) {
        const tenantId = this.getTenantId(req);
        return this.usuariosService.create(createUserDto, tenantId, req.user);
    }

    @Get()
    findAll(@Request() req) {
        const tenantId = this.getTenantId(req);
        return this.usuariosService.findAll(tenantId);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const tenantId = this.getTenantId(req);
        return this.usuariosService.findOne(id, tenantId);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto, @Request() req) {
        const tenantId = this.getTenantId(req);
        return this.usuariosService.update(id, updateUserDto, tenantId);
    }

    @Post('password/:id')
    changePassword(
        @Param('id', ParseIntPipe) id: number,
        @Body() changePasswordDto: ChangePasswordDto,
        @Request() req,
    ) {
        const tenantId = this.getTenantId(req);
        // Ahora usamos el ID que viene por la URL
        return this.usuariosService.changePassword(id, changePasswordDto, tenantId);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const tenantId = this.getTenantId(req);
        return this.usuariosService.remove(id, tenantId);
    }
}
