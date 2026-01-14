import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { EstadoEmpresa, RolUsuario } from '@prisma/client';

@Injectable()
export class AutenticacionService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.usuario.findUnique({ where: { email } });

    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      if (user.estado !== 'ACTIVO') {
        throw new UnauthorizedException('Usuario inactivo');
      }

      // Validar también que la empresa esté activa
      const tenant = await this.prisma.tenant.findUnique({
        where: { tenant_id: user.tenant_id },
      });
      if (!tenant || tenant.estado !== EstadoEmpresa.ACTIVA) {
        throw new UnauthorizedException(
          'Empresa inactiva o pendiente de aprobación',
        );
      }

      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.usuario_id,
      tenant_id: user.tenant_id,
      rol: user.rol,
      estado: user.estado,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.usuario_id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        tenant_id: user.tenant_id,
      },
    };
  }

  async register(registerDto: RegisterTenantDto) {
    const {
      nombre_empresa,
      telefono_empresa,
      direccion_empresa,
      ...adminData
    } = registerDto;

    // Verificar si el email ya existe
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: adminData.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Obtener el plan FREE (o crearlo si no existe para la demo/dev)
    // En produccion esto debería estar ya sembrado.
    let plan = await this.prisma.plan.findFirst({
      where: { nombre_plan: 'FREE' },
    });

    if (!plan) {
      // Fallback temporal si no hay seed: Crear plan FREE on the fly
      plan = await this.prisma.plan.create({
        data: {
          nombre_plan: 'FREE',
          max_usuarios: 2,
          max_productos: 50,
          precio_mensual: 0,
          precio_anual: 0,
        },
      });
    }

    // Transacción: Crear Tenant + Crear Usuario Admin
    return await this.prisma.$transaction(async (prisma) => {
      // 1. Crear Tenant
      const newTenant = await prisma.tenant.create({
        data: {
          nombre_empresa: nombre_empresa,
          telefono: telefono_empresa,
          direccion: direccion_empresa,
          email: registerDto.email_empresa, // Usar el email de la empresa
          plan_id: plan.plan_id,
          estado: EstadoEmpresa.PENDIENTE,
        },
      });

      // 2. Hashear password
      const passwordHash = await bcrypt.hash(adminData.password, 10);

      // 3. Crear Usuario Admin vinculado al Tenant
      const newUser = await prisma.usuario.create({
        data: {
          tenant_id: newTenant.tenant_id,
          email: adminData.email, // Usar el email del usuario/admin
          password_hash: passwordHash,
          nombre: adminData.nombre,
          paterno: adminData.paterno,
          materno: adminData.materno || '',
          rol: RolUsuario.PROPIETARIO,
          estado: 'ACTIVO',
        },
      });

      const { password_hash, ...userResult } = newUser;
      return {
        message: 'Empresa y usuario administrador registrados correctamente',
        tenant: newTenant,
        user: userResult,
      };
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.usuario.findUnique({ where: { email } });

    if (!user) {
      // Por seguridad, no indicamos si el email existe o no
      return {
        message: 'Si el correo existe, recibirás un enlace de recuperación.',
      };
    }

    // Generar token simple y expiración (1 hora)
    const token =
      Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);

    await this.prisma.usuario.update({
      where: { usuario_id: user.usuario_id },
      data: {
        reset_token: token,
        reset_token_exp: expiration,
      },
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `[MOCK EMAIL SERVICE] Password reset token for ${email}: ${token}`,
      );
    }

    return {
      message: 'Si el correo existe, recibirás un enlace de recuperación.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    // Buscar usuario con el token y que no haya expirado
    const user = await this.prisma.usuario.findFirst({
      where: {
        reset_token: token,
        reset_token_exp: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Token inválido o expirado');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.usuario.update({
      where: { usuario_id: user.usuario_id },
      data: {
        password_hash: passwordHash,
        reset_token: null,
        reset_token_exp: null,
      },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
}
