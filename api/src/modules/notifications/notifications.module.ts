import { PushController } from './push.controller';
import { PushService } from './push.service';
import { InboundController } from './inbound.controller';
import { InboundService } from './inbound.service';
import { DailyDigestScheduler, DailyDigestProcessor } from './daily-digest';
import { DailyDigest } from '@entities/daily-digest.entity';
import { User } from '@entities/user.entity';
import { TasksModule } from '../tasks/tasks.module';
import { ReminderActionController } from './reminder-action';
import { ReminderScheduler } from './reminder-scheduler';
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
  imports: [
    TypeOrmModule.forFeature([Reminder, Task, User, DailyDigest]),
    TasksModule,
    QueueModule,
  ],
  controllers: [
    PushController,
    InboundController,
    NotificationsController,
    ReminderActionController,
  ],
  providers: [
    PushService,
    InboundService,
    DailyDigestScheduler,
    DailyDigestProcessor,
    NotificationsService,
    ReminderScheduler,
    NotificationProcessor,
    EmailProvider,
    SmsProvider,
    WhatsappProvider,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
