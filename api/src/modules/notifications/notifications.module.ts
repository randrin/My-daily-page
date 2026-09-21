import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reminder } from '@entities/reminder.entity';
import { Task } from '@entities/task.entity';
import { QueueModule } from '../queue/queue.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationProcessor } from './processors/notification.processor';
import { EmailProvider } from './providers/email.provider';
import { SmsProvider } from './providers/sms.provider';
import { WhatsappProvider } from './providers/whatsapp.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Reminder, Task]), QueueModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationProcessor,
    EmailProvider,
    SmsProvider,
    WhatsappProvider,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
