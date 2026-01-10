import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secreto_super_seguro_por_defecto',
    });
  }

  async validate(payload: any) {
    // Esto es lo que se inyecta en req.user
    return {
        usuario_id: payload.sub,
        email: payload.email,
        tenant_id: payload.tenant_id,
        rol: payload.rol,
        estado: payload.estado
    };
  }
}
