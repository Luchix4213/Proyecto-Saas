import { Controller, Post, Body, Param, NotFoundException, UseGuards, Request } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CheckoutDto } from './dto/checkout.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomerOptionalAuthGuard } from '../../common/guards/customer-optional-auth.guard';

@Controller('public/:slug/ventas')
export class PublicVentasController {
  constructor(
    private readonly ventasService: VentasService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('checkout')
  @UseGuards(CustomerOptionalAuthGuard)
  async checkout(
    @Param('slug') slug: string,
    @Body() dto: CheckoutDto,
    @Request() req,
  ) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Tienda no encontrada');

    // Si hay un usuario logueado (Cliente), usamos su ID
    const clienteId = req.user ? req.user.sub : null;

    return this.ventasService.createOnlineSale(tenant.tenant_id, clienteId, dto);
  }
}
