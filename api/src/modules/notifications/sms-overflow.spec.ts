import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Job, Queue } from 'bullmq';
import { NotificationProcessor } from './processors/notification.processor';
import { EmailProvider } from './providers/email.provider';
import { SmsProvider } from './providers/sms.provider';
import { WhatsappProvider } from './providers/whatsapp.provider';
import { SmsOverflowService } from './sms-overflow';
import { NotificationJobPayload } from './interfaces/notification-job.interface';
import { UltraMsgDeliveryService } from './ultramsg-delivery.service';
import { DeliveryService } from './delivery.service';

it('collects an SMS overflow instead of sending a separate email or SMS', async () => {
  const now = new Date();
  const reminder = {
    id: 'reminder',
    attempts: 0,
    status: 'PENDING',
    channel: 'SMS',
    triggerAt: now,
    task: {
      id: 'task',
      userId: 'owner',
      title: 'Task',
      status: 'TODO',
      priority: 'MEDIUM',
      deadline: now,
      user: {
        email: 'test@example.com',
        phoneNumber: '+33612345678',
        timezone: 'Europe/Paris',
        notificationsEnabled: true,
        quietHoursEnabled: false,
        notifChannels: [
          { channel: 'SMS', enabled: true },
          { channel: 'EMAIL', enabled: true },
        ],
      },
    },
  };
  const repo = {
    findOne: jest.fn().mockResolvedValue(reminder),
    update: jest.fn(),
  };
  const runner = {
    connect: jest.fn(),
    release: jest.fn(),
    query: jest.fn().mockResolvedValue([{ locked: true }]),
    manager: { getRepository: () => repo },
  };
  const send = jest.fn();
  const collect = jest.fn().mockResolvedValue(undefined);
  const worker = new NotificationProcessor(
    { createQueryRunner: () => runner } as unknown as DataSource,
    new ConfigService({
      notifications: { enabled: true, appUrl: 'https://app.example.com' },
      jwt: { secret: 'test' },
    }),
    {
      client: Promise.resolve({ eval: () => Promise.resolve(0) }),
    } as unknown as Queue<NotificationJobPayload>,
    { send } as unknown as EmailProvider,
    { send } as unknown as SmsProvider,
    { send } as unknown as WhatsappProvider,
    undefined,
    { collect } as unknown as SmsOverflowService,
  );
  await worker.process({
    data: { reminderId: 'reminder' },
  } as Job<NotificationJobPayload>);
  expect(collect).toHaveBeenCalledWith(
    'reminder',
    'owner',
    expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
  );
  expect(send).not.toHaveBeenCalled();
  expect(repo.update).not.toHaveBeenCalledWith(
    'reminder',
    expect.objectContaining({ status: 'SENT' }),
  );
});

describe('UltraMsg delivery correlation', () => {
  afterEach(() => jest.restoreAllMocks());
  it('uses numeric provider IDs and authenticated ACK values, never phone/title matching', async () => {
    const event = jest.fn();
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          messages: [
            { id: 123, ack: 'device' },
            { id: 456, ack: 'read' },
          ],
        }),
    } as Response);
    const service = new UltraMsgDeliveryService(
      {
        query: () => Promise.resolve([{ provider_message_id: '123' }]),
      } as unknown as DataSource,
      new ConfigService({
        ultramsg: { instanceId: 'instance123', token: 'test-token' },
      }),
      { event } as unknown as DeliveryService,
    );
    await service.reconcile();
    expect(event).toHaveBeenCalledTimes(1);
    expect(event).toHaveBeenCalledWith(
      'ultramsg',
      '123-delivered',
      '123',
      'delivered',
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('does not claim delivery when provider lookup fails', async () => {
    const event = jest.fn();
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({ ok: false, status: 503 } as Response);
    const service = new UltraMsgDeliveryService(
      {
        query: () => Promise.resolve([{ provider_message_id: '123' }]),
      } as unknown as DataSource,
      new ConfigService({
        ultramsg: { instanceId: 'instance123', token: 'test-token' },
      }),
      { event } as unknown as DeliveryService,
    );
    await expect(service.reconcile()).rejects.toThrow('HTTP 503');
    expect(event).not.toHaveBeenCalled();
  });
});
