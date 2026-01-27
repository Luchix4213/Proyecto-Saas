import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip } = request;

    // Only log write operations
    const writeMethods = ['POST', 'PATCH', 'DELETE'];
    if (!writeMethods.includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          if (!user) return;

          // Detect module from URL (e.g., /productos/1 -> PRODUCTOS)
          const modulo = url.split('/')[1]?.split('?')[0]?.toUpperCase() || 'SISTEMA';

          const actionMap = {
            POST: 'CREAR',
            PATCH: 'EDITAR',
            DELETE: 'ELIMINAR'
          };
          const accion = actionMap[method];

          // Sanitize metadata (remove sensitive fields)
          const sanitize = (obj: any) => {
            if (!obj) return null;
            const logData = { ...obj };
            const sensitiveFields = ['password', 'password_hash', 'token', 'reset_token'];
            sensitiveFields.forEach(field => delete logData[field]);
            return logData;
          };

          await this.auditService.createLog({
            tenant_id: user.tenant_id,
            usuario_id: user.usuario_id,
            modulo,
            accion,
            detalle: `Acción ${accion} realizada en el recurso ${url}`,
            metadata: {
              body: sanitize(body),
              // We don't log full response to avoid DB bloat, just the ID if available
              responseId: response?.id || response?.[`${modulo.toLowerCase()}_id`] || null
            },
            ip_address: ip,
          });
        } catch (error) {
          console.error('Error recording audit log:', error);
        }
      }),
    );
  }
}
