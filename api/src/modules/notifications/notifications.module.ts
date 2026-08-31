import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationProcessor } from './processors/notification.processor';
import { EmailProvider } from './providers/email.provider';
import { SmsProvider } from './providers/sms.provider';
import { WhatsappProvider } from './providers/whatsapp.provider';

@Module({
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
