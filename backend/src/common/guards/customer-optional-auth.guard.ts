import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class CustomerOptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    // No lanzamos error si no hay usuario, simplemente retornamos null
    if (err || !user) {
      return null;
    }
    return user;
  }
}
