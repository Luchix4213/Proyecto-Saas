import { Controller, Get, Post, Query, Body, BadRequestException } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { EstadoConfirmacion } from '@prisma/client';

@Controller('public/ventas')
export class PublicVentasController {
    constructor(private readonly ventasService: VentasService) { }

    @Get('verify-token')
    async verifyToken(@Query('token') token: string) {
        if (!token) throw new BadRequestException('Token requerido');
        return this.ventasService.validateConfirmationToken(token);
    }

    @Post('confirm')
    async confirm(
        @Body('token') token: string,
        @Body('status') status: EstadoConfirmacion,
        @Body('comment') comment?: string
    ) {
        if (!token || !status) throw new BadRequestException('Datos incompletos');
        return this.ventasService.processConfirmation(token, status, comment);
    }
}
