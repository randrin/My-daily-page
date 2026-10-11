import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  NotifChannel,
  Priority,
  ReminderStatus,
  TaskStatus,
} from '@entities/enums';
import { parseInboundCommand, snoozeUntil } from './inbound-command';
import { InboundService } from './inbound.service';
import { InboundController } from './inbound.controller';
import { PushService, isTrustedPushEndpoint } from './push.service';
import { PushSubscriptionDto } from './dto/push-subscription.dto';
import { adaptivePlan } from './adaptive-plan';
import { nextDeliveryTime } from './daily-timing';
import * as webpush from 'web-push';
import * as twilio from 'twilio';
import type { Response } from 'express';
import { User } from '@entities/user.entity';
import { Task } from '@entities/task.entity';
import { Reminder } from '@entities/reminder.entity';

jest.mock('web-push', () => ({ sendNotification: jest.fn() }));
const now = new Date('2026-10-24T20:00:00Z');
const settings = {
  timezone: 'Europe/Paris',
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  quietHoursAllowUrgent: false,
  smartQuietHoursEnabled: true,
};

describe('P3 commands and quiet hours', () => {
  it('parses commands with explicit task codes and rejects extra text', () => {
    expect(parseInboundCommand(' fait aabbcc112233 ')).toEqual({
      action: 'done',
      taskCode: 'aabbcc112233',
    });
    expect(parseInboundCommand('DEMAIN 9H')).toEqual({
      action: 'tomorrow',
      taskCode: undefined,
    });
    expect(parseInboundCommand('1H')).toEqual({
      action: 'hour',
      taskCode: undefined,
    });
    expect(parseInboundCommand('FAIT ALL')).toBeUndefined();
  });
  it('calculates tomorrow at 9h across the autumn DST change', () => {
    expect(snoozeUntil('tomorrow', now, 'Europe/Paris').toISOString()).toBe(
      '2026-10-25T08:00:00.000Z',
    );
    expect(snoozeUntil('hour', now, 'Europe/Paris').getTime()).toBe(
      now.getTime() + 3600000,
    );
  });
  it('only bypasses quiet hours for urgent tasks due on the current local day', () => {
    expect(
      nextDeliveryTime(
        now,
        settings,
        Priority.URGENT,
        new Date('2026-10-24T21:00Z'),
      ),
    ).toEqual(now);
    expect(
      nextDeliveryTime(now, settings, Priority.HIGH, now).getTime(),
    ).toBeGreaterThan(now.getTime());
    expect(
      nextDeliveryTime(
        now,
        settings,
        Priority.URGENT,
        new Date('2026-10-26T21:00Z'),
      ).getTime(),
    ).toBeGreaterThan(now.getTime());
    expect(
      nextDeliveryTime(
        now,
        {
          ...settings,
          notificationsPausedUntil: new Date('2026-10-26T12:00Z'),
        },
        Priority.URGENT,
        now,
      ).toISOString(),
    ).toBe('2026-10-26T12:00:00.000Z');
  });
  it('plans two emails followed by WhatsApp only when both are enabled', () => {
    const task = {
      deadline: now,
      priority: Priority.MEDIUM,
      status: TaskStatus.TODO,
    };
    expect(
      adaptivePlan(task, [NotifChannel.EMAIL, NotifChannel.WHATSAPP], now).map(
        (p) => p.channel,
      ),
    ).toEqual([NotifChannel.EMAIL, NotifChannel.EMAIL, NotifChannel.WHATSAPP]);
    expect(adaptivePlan(task, [NotifChannel.EMAIL], now)).toEqual([]);
    expect(
      adaptivePlan(
        { ...task, status: TaskStatus.DONE },
        [NotifChannel.EMAIL, NotifChannel.WHATSAPP],
        now,
      ),
    ).toEqual([]);
  });
});

describe('Inbound mutation safety', () => {
  function fixture(tasks: { id: string; status: TaskStatus }[] = []) {
    const query = jest.fn().mockResolvedValue([]);
    const save = jest.fn();
    const update = jest.fn();
    const manager = {
      query,
      save,
      update,
      create: jest.fn((_entity, data: unknown) => data),
      find: jest.fn((entity: unknown) =>
        Promise.resolve(
          entity === User
            ? [{ id: 'owner', timezone: 'Europe/Paris' }]
            : entity === Reminder
              ? tasks.map((task) => ({ taskId: task.id }))
              : tasks,
        ),
      ),
      findOne: jest.fn().mockResolvedValue({
        id: tasks[0]?.id,
        status: TaskStatus.TODO,
        blockers: [],
        userId: 'owner',
      }),
    };
    const source = {
      transaction: (work: (manager: unknown) => unknown) => work(manager),
    };
    return {
      service: new InboundService(source as unknown as DataSource),
      manager,
      query,
      save,
      update,
    };
  }
  it('does not mutate when the sender has multiple eligible tasks', async () => {
    const f = fixture([
      { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', status: TaskStatus.TODO },
      { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', status: TaskStatus.TODO },
    ]);
    expect(
      await f.service.receive(
        'twilio',
        'event',
        '+33612345678',
        NotifChannel.SMS,
        'FAIT',
      ),
    ).toContain('Plusieurs tâches');
    expect(f.save).not.toHaveBeenCalled();
  });
  it('returns a stored result on retry without applying the command again', async () => {
    const f = fixture();
    f.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ result: 'Déjà traité' }]);
    expect(
      await f.service.receive(
        'twilio',
        'event',
        '+33612345678',
        NotifChannel.SMS,
        '1H',
      ),
    ).toBe('Déjà traité');
    expect(f.manager.find).not.toHaveBeenCalled();
    expect(f.save).not.toHaveBeenCalled();
  });
  it('snoozes a specific owned task and creates one future reminder without changing its deadline', async () => {
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const f = fixture([{ id, status: TaskStatus.TODO }]);
    await f.service.receive(
      'twilio',
      'event',
      '+33612345678',
      NotifChannel.SMS,
      '1H aaaaaaaaaaaa',
    );
    expect(f.save).toHaveBeenCalledTimes(2);
    const calls = f.save.mock.calls as unknown as unknown[][];
    const savedTask = calls[0][0] as Task;
    expect(savedTask.remindersSnoozedUntil).toBeInstanceOf(Date);
    expect(savedTask.deadline).toBeUndefined();
    expect(f.manager.findOne).toHaveBeenCalledWith(
      Task,
      expect.objectContaining({
        where: { id, userId: 'owner' },
        lock: { mode: 'pessimistic_write' },
      }),
    );
  });
  it('rejects unsigned Twilio requests before service execution', async () => {
    const receive = jest.fn();
    const controller = new InboundController(
      { get: () => undefined } as unknown as ConfigService,
      { receive } as unknown as InboundService,
    );
    await expect(controller.twilio({}, '', {} as Response)).rejects.toThrow(
      'Invalid webhook signature',
    );
    expect(receive).not.toHaveBeenCalled();
  });
  it('accepts a signed WhatsApp button payload using the exact configured URL', async () => {
    const values: Record<string, string> = {
      'twilio.authToken': 'test-secret',
      'twilio.accountSid': 'ACtest',
      'twilio.inboundUrl': 'https://example.com/notification-webhooks/twilio',
    };
    const receive = jest.fn().mockResolvedValue('Tâche terminée');
    const controller = new InboundController(
      { get: (key: string) => values[key] } as unknown as ConfigService,
      { receive } as unknown as InboundService,
    );
    const body = {
      AccountSid: 'ACtest',
      MessageSid: `SM${'a'.repeat(32)}`,
      From: 'whatsapp:+33612345678',
      Body: 'J’ai fait',
      ButtonPayload: 'FAIT aaaaaaaaaaaa',
    };
    const signature = twilio.getExpectedTwilioSignature(
      values['twilio.authToken'],
      values['twilio.inboundUrl'],
      body,
    );
    const response = { type: jest.fn().mockReturnThis(), send: jest.fn() };
    await controller.twilio(body, signature, response as unknown as Response);
    expect(receive).toHaveBeenCalledWith(
      'twilio',
      body.MessageSid,
      body.From,
      NotifChannel.WHATSAPP,
      body.ButtonPayload,
    );
    expect(response.send).toHaveBeenCalledWith(
      expect.stringContaining('<Message>'),
    );
  });
});

describe('Web push', () => {
  it('restricts endpoints to browser push services, without credentials or custom ports', () => {
    expect(
      isTrustedPushEndpoint('https://fcm.googleapis.com/fcm/send/token'),
    ).toBe(true);
    for (const endpoint of [
      'https://web.push.apple.com/token',
      'https://web.push.apple.com:443/token',
      'https://example.push.apple.com/token',
      'https://updates.push.services.mozilla.com/wpush/v2/token',
    ])
      expect(isTrustedPushEndpoint(endpoint)).toBe(true);
    for (const endpoint of [
      'https://push.apple.com.evil.test/token',
      'https://evilpush.apple.com/token',
      'https://user:pass@web.push.apple.com/token',
      'http://web.push.apple.com/token',
      'https://web.push.apple.com:8443/token',
      'http://127.0.0.1/',
      'https://localhost/',
      'https://fcm.googleapis.com.evil.test/',
      'https://user:pass@fcm.googleapis.com/',
      'https://fcm.googleapis.com:8443/',
    ])
      expect(isTrustedPushEndpoint(endpoint)).toBe(false);
  });
  it('validates browser subscription JSON and requires encryption keys', async () => {
    expect(
      await validate(
        plainToInstance(PushSubscriptionDto, {
          endpoint: 'https://fcm.googleapis.com/fcm/send/token',
          expirationTime: null,
          keys: { p256dh: 'a'.repeat(87), auth: 'b'.repeat(22) },
        }),
      ),
    ).toHaveLength(0);
    expect(
      (
        await validate(
          plainToInstance(PushSubscriptionDto, {
            endpoint: 'https://fcm.googleapis.com/fcm/send/token',
          }),
        )
      ).length,
    ).toBeGreaterThan(0);
  });
  it('deletes an expired subscription instead of blindly retrying', async () => {
    const repo = {
      findBy: jest.fn().mockResolvedValue([
        {
          id: 'expired',
          endpoint: 'https://fcm.googleapis.com/fcm/send/token',
          p256dh: 'key',
          auth: 'auth',
        },
      ]),
      delete: jest.fn(),
    };
    const send = webpush.sendNotification as jest.Mock;
    send.mockRejectedValueOnce({ statusCode: 410 });
    const service = new PushService(
      { getRepository: () => repo } as unknown as DataSource,
      { get: () => 'test-value' } as unknown as ConfigService,
    );
    await expect(
      service.send('owner', {
        title: 'Reminder',
        body: 'Task',
        url: '/dashboard/today',
        tag: 'id',
      }),
    ).rejects.toThrow('non confirmé');
    expect(repo.findBy).toHaveBeenCalledWith({ userId: 'owner' });
    expect(repo.delete).toHaveBeenCalledWith('expired');
  });
});

it('keeps a full hour between accepted adaptive steps even after a worker delay', async () => {
  const { NotificationProcessor } =
    await import('./processors/notification.processor');
  const { DelayedError } = await import('bullmq');
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-08T12:00:00Z'));
  try {
    const deadline = new Date('2026-10-08T11:00:00Z');
    const task = {
      id: 'task',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      deadline,
      user: {
        notificationsEnabled: true,
        adaptiveEscalationEnabled: true,
        notifChannels: [
          { channel: NotifChannel.EMAIL, enabled: true },
          {
            channel: NotifChannel.WHATSAPP,
            enabled: true,
            whatsappOptIn: true,
          },
        ],
      },
    };
    const repo = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce({
          id: 'second',
          task,
          channel: NotifChannel.EMAIL,
          status: ReminderStatus.PENDING,
          automaticKey: 'adaptive-task-EMAIL-2026-10-08T12:00:00.000Z',
          triggerAt: new Date(),
        })
        .mockResolvedValueOnce({ sentAt: new Date('2026-10-08T11:45:00Z') }),
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
      {} as never,
      provider as never,
      provider as never,
      provider as never,
    );
    const job = {
      data: { reminderId: 'second' },
      token: 'lock',
      moveToDelayed: jest.fn(),
    };
    await expect(worker.process(job as never)).rejects.toBeInstanceOf(
      DelayedError,
    );
    expect(job.moveToDelayed).toHaveBeenCalledWith(
      Date.parse('2026-10-08T12:45:00Z'),
      'lock',
    );
    expect(provider.send).not.toHaveBeenCalled();
  } finally {
    jest.useRealTimers();
  }
});
