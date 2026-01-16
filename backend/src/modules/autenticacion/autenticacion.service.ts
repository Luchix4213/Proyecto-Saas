import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { EstadoEmpresa, RolUsuario } from '@prisma/client';

@Injectable()
export class AutenticacionService {
  private transporter;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    // Inicializar transporter si existen las credenciales
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

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
      rubros,
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
          rubros: rubros ? { connect: rubros.map(id => ({ rubro_id: id })) } : undefined,
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

      // 4. Crear Suscripción Inicial (FREE)
      await prisma.suscripcion.create({
        data: {
          tenant_id: newTenant.tenant_id,
          plan_id: plan.plan_id,
          fecha_inicio: new Date(),
          fecha_fin: new Date(new Date().setMonth(new Date().getMonth() + 1)), // 1 mes por defecto
          monto: plan.precio_mensual || 0,
          metodo_pago: 'EFECTIVO', // O lo que corresponda a FREE/Demo
          estado: 'ACTIVA',
          referencia: 'Registro Inicial'
        }
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
      return {
        message: 'Si el correo existe, recibirás un enlace de recuperación.',
      };
    }

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

    try {
      await this.sendEmail(email, token);
    } catch (error) {
      console.error('Error enviando email:', error);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[FALLBACK LOG] Token for ${email}: ${token}`);
      }
    }

    return {
      message: 'Si el correo existe, recibirás un enlace de recuperación.',
    };
  }

  async verifyToken(token: string) {
    const user = await this.prisma.usuario.findFirst({
      where: {
        reset_token: token,
        reset_token_exp: { gt: new Date() },
      },
    });

    if (!user) {
      return { valid: false, message: 'Token inválido o expirado' };
    }
    return { valid: true, message: 'Token válido' };
  }

  async resetPassword(token: string, newPassword: string) {
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

  private async sendEmail(to: string, token: string) {
    if (!this.transporter) {
      console.warn('SMTP no configurado. Token:', token);
      return;
    }

    const mailOptions = {
      from: `"Soporte Kipu" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Recuperación de Contraseña - Kipu',
      text: `Hola,\n\nHas solicitado restablecer tu contraseña. Tu código de verificación es:\n\n${token}\n\nSi no fuiste tú, por favor ignora este mensaje.\n\nSaludos,\nEl equipo de Kipu`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4F46E5;">Recuperación de Contraseña</h2>
          <p>Hola,</p>
          <p>Has solicitado restablecer tu contraseña en <strong>Kipu</strong>.</p>
          <p>Copia y pega el siguiente código de verificación en la aplicación:</p>
          <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #111;">${token}</span>
          </div>
          <p>Este código expirará en 1 hora.</p>
          <p style="font-size: 12px; color: #666; margin-top: 30px;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async getProfile(userId: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { usuario_id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const { password_hash, reset_token, reset_token_exp, ...result } = user;
    return result;
  }

  async updateProfile(userId: number, data: import('./dto/update-profile.dto').UpdateProfileDto) {
    const { password, email, ...updateData } = data;

    // Si cambia el email, verificar unicidad
    if (email) {
      const existingUser = await this.prisma.usuario.findUnique({
        where: { email },
      });
      if (existingUser && existingUser.usuario_id !== userId) {
        throw new ConflictException('El email ya está en uso por otro usuario');
      }
    }

    const dataToUpdate: any = {
      ...updateData,
      ...(email && { email }),
    };

    if (password) {
      dataToUpdate.password_hash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await this.prisma.usuario.update({
      where: { usuario_id: userId },
      data: dataToUpdate,
    });

    const { password_hash, reset_token, reset_token_exp, ...result } = updatedUser;
    return result;
  }
}
