import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { NotifChannel, ReminderStatus } from '@prisma/client';
import { Job } from 'bullmq';
import { NOTIFICATION_QUEUE } from '../../queue/queue.constants';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationJobPayload } from '../interfaces/notification-job.interface';
import { EmailProvider } from '../providers/email.provider';
import { SmsProvider } from '../providers/sms.provider';
import { WhatsappProvider } from '../providers/whatsapp.provider';

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailProvider: EmailProvider,
    private readonly smsProvider: SmsProvider,
    private readonly whatsappProvider: WhatsappProvider,
  ) {
    super();
  }

  async process(job: Job<NotificationJobPayload>): Promise<void> {
    const { reminderId, channel, recipient, subject, body } = job.data;

    try {
      switch (channel) {
        case NotifChannel.EMAIL:
          await this.emailProvider.send(
            recipient,
            subject ?? 'Notification',
            body,
          );
          break;
        case NotifChannel.SMS:
          await this.smsProvider.send(recipient, body);
          break;
        case NotifChannel.WHATSAPP:
          await this.whatsappProvider.send(recipient, body);
          break;
        default:
          throw new Error('Unsupported notification channel');
      }

      await this.prisma.reminder.update({
        where: { id: reminderId },
        data: {
          status: ReminderStatus.SENT,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Reminder ${reminderId} failed: ${message}`);

      await this.prisma.reminder.update({
        where: { id: reminderId },
        data: { status: ReminderStatus.FAILED },
      });

      throw error;
    }
  }
}
