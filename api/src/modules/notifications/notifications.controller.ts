import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { toReminderResponse } from '../tasks/task.mapper';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@Query('taskId') taskId?: string) {
    const reminders = await this.notificationsService.findAll(taskId);
    return reminders.map(toReminderResponse);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const reminder = await this.notificationsService.findOne(id);
    return toReminderResponse(reminder);
  }

  @Post('send')
  async send(@Body() sendNotificationDto: SendNotificationDto) {
    const reminder = await this.notificationsService.send(sendNotificationDto);
    return toReminderResponse(reminder);
  }
}
