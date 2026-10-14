import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Job, Queue } from 'bullmq';
import { ReminderStatus } from '@entities/enums';
import { NotificationProcessor } from './processors/notification.processor';
import { EmailProvider } from './providers/email.provider';
import { SmsProvider } from './providers/sms.provider';
import { WhatsappProvider } from './providers/whatsapp.provider';
import { NotificationJobPayload } from './interfaces/notification-job.interface';
it('cancels a queued reminder using fresh account state and never calls any provider', async () => {
  const repo = {
    findOne: jest.fn().mockResolvedValue({
      id: 'reminder',
      status: ReminderStatus.PENDING,
      triggerAt: new Date(),
      task: { userId: 'account' },
    }),
    update: jest.fn(),
  };
  const runner = {
    connect: jest.fn(),
    release: jest.fn(),
    query: jest.fn((sql: string) =>
      Promise.resolve(
        sql.includes('AS blocked') ? [{ blocked: true }] : [{ locked: true }],
      ),
    ),
    manager: { getRepository: () => repo },
  };
  const provider = { send: jest.fn() };
  const worker = new NotificationProcessor(
    { createQueryRunner: () => runner } as unknown as DataSource,
    {} as ConfigService,
    {} as Queue<NotificationJobPayload>,
    provider as unknown as EmailProvider,
    provider as unknown as SmsProvider,
    provider as unknown as WhatsappProvider,
  );
  await worker.process({
    data: { reminderId: 'reminder' },
  } as Job<NotificationJobPayload>);
  expect(provider.send).not.toHaveBeenCalled();
  expect(repo.update).toHaveBeenCalledWith('reminder', {
    status: ReminderStatus.CANCELLED,
    lastError: 'Compte suspendu',
  });
  expect(runner.query).toHaveBeenCalledWith(
    expect.stringContaining('pg_advisory_unlock_shared'),
    ['account'],
  );
  expect(runner.release).toHaveBeenCalled();
});
