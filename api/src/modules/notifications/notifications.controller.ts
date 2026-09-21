import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ApiJwtAuth } from '@common/decorators/api-jwt-auth.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { AuthUser } from '@common/types/auth-user';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { toReminderResponse } from '../tasks/task.mapper';

@ApiTags('notifications')
@ApiJwtAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Historique des notifications / rappels' })
  @ApiQuery({
    name: 'taskId',
    required: false,
    description: 'Filtrer par tâche',
  })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('taskId') taskId?: string,
  ) {
    const reminders = await this.notificationsService.findAll(user.id, taskId);
    return reminders.map(toReminderResponse);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’une notification' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const reminder = await this.notificationsService.findOne(id, user.id);
    return toReminderResponse(reminder);
  }

  @Post('send')
  @ApiOperation({
    summary: 'Envoyer une notification (enqueue BullMQ, jamais synchrone)',
  })
  async send(
    @CurrentUser() user: AuthUser,
    @Body() sendNotificationDto: SendNotificationDto,
  ) {
    const reminder = await this.notificationsService.send(
      user.id,
      sendNotificationDto,
    );
    return toReminderResponse(reminder);
  }
}
