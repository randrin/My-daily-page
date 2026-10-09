import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { DelayedError, Job, Queue } from 'bullmq';
import {
  NotifChannel,
  Priority,
  ReminderStatus,
  TaskStatus,
} from '@entities/enums';
import { NotificationProcessor } from './processors/notification.processor';
import { EmailProvider } from './providers/email.provider';
import { SmsProvider } from './providers/sms.provider';
import { WhatsappProvider } from './providers/whatsapp.provider';
import { NotificationJobPayload } from './interfaces/notification-job.interface';

it('defers an already queued reminder when quiet hours were enabled afterwards', async () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-07T21:00:00Z'));
  try {
    const repo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'reminder',
        status: ReminderStatus.PENDING,
        triggerAt: new Date('2026-10-07T21:00Z'),
        channel: NotifChannel.EMAIL,
        task: {
          status: TaskStatus.TODO,
          priority: Priority.HIGH,
          user: {
            timezone: 'Europe/Paris',
            notificationsEnabled: true,
            quietHoursEnabled: true,
            quietHoursStart: '22:00',
            quietHoursEnd: '07:00',
            quietHoursAllowUrgent: false,
            notifChannels: [{ channel: NotifChannel.EMAIL, enabled: true }],
          },
        },
      }),
      update: jest.fn(),
    };
    const runner = {
      connect: jest.fn(),
      release: jest.fn(),
      query: jest.fn().mockResolvedValue([{ locked: true }]),
      manager: { getRepository: () => repo },
    };
    const provider = { send: jest.fn() };
    const worker = new NotificationProcessor(
      { createQueryRunner: () => runner } as unknown as DataSource,
      { get: () => true } as unknown as ConfigService,
      {} as Queue<NotificationJobPayload>,
      provider as unknown as EmailProvider,
      provider as unknown as SmsProvider,
      provider as unknown as WhatsappProvider,
    );
    const job = {
      data: { reminderId: 'reminder', channel: NotifChannel.EMAIL },
      token: 'lock',
      moveToDelayed: jest.fn(),
    };
    await expect(
      worker.process(job as unknown as Job<NotificationJobPayload>),
    ).rejects.toBeInstanceOf(DelayedError);
    expect(job.moveToDelayed).toHaveBeenCalledWith(
      Date.parse('2026-10-08T05:00Z'),
      'lock',
    );
    expect(provider.send).not.toHaveBeenCalled();
    expect(repo.update).not.toHaveBeenCalled();
    expect(runner.release).toHaveBeenCalled();
  } finally {
    jest.useRealTimers();
  }
});
