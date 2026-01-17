import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe, UnauthorizedException, Query } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

@Controller('clientes')
@UseGuards(AuthGuard)
export class ClientesController {
    constructor(private readonly clientesService: ClientesService) { }

    private getTenantId(req: RequestWithUser): number {
        if (!req.user || !req.user.tenant_id) {
            throw new UnauthorizedException('Usuario no autenticado o sin tenant_id');
        }
        return req.user.tenant_id;
    }

    @Post()
    create(@Body() createClienteDto: CreateClienteDto, @Req() req: RequestWithUser) {
        const tenantId = this.getTenantId(req);
        return this.clientesService.create(createClienteDto, tenantId);
    }

    @Get('admin/all')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    findAllGlobal(@Query('search') search?: string) {
        return this.clientesService.findAllGlobal({ search });
    }

    @Get()
    findAll(@Req() req: RequestWithUser) {
        const tenantId = this.getTenantId(req);
        return this.clientesService.findAll(tenantId);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
        const tenantId = this.getTenantId(req);
        return this.clientesService.findOne(id, tenantId);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateClienteDto: UpdateClienteDto, @Req() req: RequestWithUser) {
        const tenantId = this.getTenantId(req);
        return this.clientesService.update(id, updateClienteDto, tenantId);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
        const tenantId = this.getTenantId(req);
        return this.clientesService.remove(id, tenantId);
    }
}
