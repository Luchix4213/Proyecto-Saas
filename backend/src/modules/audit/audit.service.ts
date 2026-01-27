import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async createLog(data: CreateAuditLogDto, prismaClient?: any) {
    const prisma = prismaClient || this.prisma;
    return prisma.auditLog.create({
      data: {
        tenant_id: data.tenant_id,
        usuario_id: data.usuario_id,
        modulo: data.modulo,
        accion: data.accion,
        detalle: data.detalle,
        metadata: data.metadata || {},
        ip_address: data.ip_address,
      },
    });
  }

  async getLogsByTenant(tenantId: number) {
    return this.prisma.auditLog.findMany({
      where: { tenant_id: tenantId },
      orderBy: { fecha_hora: 'desc' },
      take: 100, // Limit to last 100 for performance
      include: {
        usuario: {
          select: {
            nombre: true,
            paterno: true,
            email: true,
          }
        }
      }
    });
  }

  async getAllLogs() {
    return this.prisma.auditLog.findMany({
      orderBy: { fecha_hora: 'desc' },
      take: 200,
      include: {
        usuario: {
          select: {
            nombre: true,
            email: true,
          }
        },
        tenant: {
          select: {
            nombre_empresa: true,
          }
        }
      }
    });
  }
}
