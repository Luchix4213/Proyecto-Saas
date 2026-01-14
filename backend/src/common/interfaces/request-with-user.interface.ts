import { Request } from 'express';

export interface RequestWithUser extends Request {
    user: {
        usuario_id: number;
        email: string;
        tenant_id: number;
        rol: string;
    }
}
