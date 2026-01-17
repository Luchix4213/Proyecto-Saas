import { Controller, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { RegisterCustomerDto, LoginCustomerDto } from './dto/customer-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('public/:slug/auth')
export class CustomerAuthController {
  constructor(
    private readonly clientesService: ClientesService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('register')
  async register(@Param('slug') slug: string, @Body() dto: RegisterCustomerDto) {
    const tenant = await this.getTenantBySlug(slug);
    const cliente = await this.clientesService.register(tenant.tenant_id, dto);
    const token = this.generateToken(cliente);
    return { cliente, access_token: token };
  }

  @Post('login')
  async login(@Param('slug') slug: string, @Body() dto: LoginCustomerDto) {
    const tenant = await this.getTenantBySlug(slug);
    const cliente = await this.clientesService.validateCustomer(tenant.tenant_id, dto);
    const token = this.generateToken(cliente);
    return { cliente, access_token: token };
  }

  private async getTenantBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Tienda no encontrada');
    return tenant;
  }

  private generateToken(cliente: any) {
    const payload = {
      sub: cliente.cliente_id,
      email: cliente.email,
      tenant_id: cliente.tenant_id,
      rol: 'CLIENTE',
    };
    return this.jwtService.sign(payload);
  }
}
