import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Patch,
  UnauthorizedException,
} from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service';
import { LoginDto } from './dto/login.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('auth')
export class AutenticacionController {
  constructor(private authService: AutenticacionService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterTenantDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto & { expoPushToken?: string }) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.authService.login(user, loginDto.expoPushToken);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('verify-token')
  async verifyToken(@Body('token') token: string) {
    const result = await this.authService.verifyToken(token);
    if (!result.valid) {
      throw new UnauthorizedException(result.message);
    }
    return result;
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    // En produccion usar DTO robusto
    return this.authService.resetPassword(body.token, body.password);
  }

  // Endpoint de prueba para verificar token
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.usuario_id);
  }

  @UseGuards(AuthGuard)
  @Patch('profile')
  updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.usuario_id, updateProfileDto);
  }
}
