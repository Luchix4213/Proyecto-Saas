import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        // TODO: Extract tenant_id from User (Request) after AuthGuard is implemented
        // const user = request.user;
        // if (user) {
        //   request.tenant_id = user.tenant_id;
        // }
        return next.handle();
    }
}
