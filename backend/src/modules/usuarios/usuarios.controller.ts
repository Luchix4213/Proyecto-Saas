import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, UseGuards, Req, Delete, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import type { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

@Controller('usuarios')
@UseGuards(AuthGuard)
export class UsuariosController {
    constructor(private readonly usuariosService: UsuariosService) { }

    private getTenantId(req: RequestWithUser): number {
        if (!req.user || !req.user.tenant_id) {
            throw new UnauthorizedException('Usuario no autenticado o sin tenant_id');
        }
        return req.user.tenant_id;
    }

    @Post()
    create(@Body() createUserDto: CreateUserDto, @Req() req: RequestWithUser) {
        const tenantId = this.getTenantId(req);
        return this.usuariosService.create(createUserDto, tenantId, req.user);
    }

    @Get()
    findAll(@Req() req: RequestWithUser) {
        const tenantId = this.getTenantId(req);
        return this.usuariosService.findAll(tenantId);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
        const tenantId = this.getTenantId(req);
        return this.usuariosService.findOne(id, tenantId);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto, @Req() req: RequestWithUser) {
        const tenantId = this.getTenantId(req);
        return this.usuariosService.update(id, updateUserDto, tenantId, req.user);
    }

    @Post('password/:id')
    changePassword(
        @Param('id', ParseIntPipe) id: number,
        @Body() changePasswordDto: ChangePasswordDto,
        @Req() req: RequestWithUser,
    ) {
        const tenantId = this.getTenantId(req);
        return this.usuariosService.changePassword(id, changePasswordDto, tenantId);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
        const tenantId = this.getTenantId(req);
        return this.usuariosService.remove(id, tenantId);
    }
}
