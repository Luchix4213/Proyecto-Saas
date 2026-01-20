import { Controller, Get, Patch, Delete, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('notificaciones')
@UseGuards(AuthGuard)
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  findAll(@Request() req) {
    return this.notificacionesService.findAllForUser(req.user.usuario_id);
  }

  @Patch(':id/leer')
  markAsRead(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.notificacionesService.markAsRead(id, req.user.usuario_id);
  }

  @Patch('leer-todas')
  markAllAsRead(@Request() req) {
    return this.notificacionesService.markAllAsRead(req.user.usuario_id);
  }

  @Delete('limpiar-leidas')
  removeRead(@Request() req) {
    return this.notificacionesService.removeRead(req.user.usuario_id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.notificacionesService.remove(id, req.user.usuario_id);
  }
}
