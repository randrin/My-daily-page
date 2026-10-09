import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { DelayedError, Job, Queue } from 'bullmq';
import { User } from '@entities/user.entity';
import { DailyDigest } from '@entities/daily-digest.entity';
import { NotifChannel } from '@entities/enums';
import { DailyDigestProcessor, DailyDigestScheduler } from './daily-digest';
import { TasksService } from '../tasks/tasks.service';
import { EmailProvider } from './providers/email.provider';

const user = {
  id: 'owner',
  email: 'test@example.invalid',
  timezone: 'Europe/Paris',
  notificationsEnabled: true,
  dailyDigestEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  quietHoursAllowUrgent: false,
  notifChannels: [{ channel: NotifChannel.EMAIL, enabled: true }],
};
const config = {
  get: jest.fn((key: string) =>
    key === 'notifications.enabled' ? true : 'https://example.invalid',
  ),
} as unknown as ConfigService;

function processorFixture(change: Record<string, unknown> = {}) {
  const digest = {
    id: 'digest',
    userId: 'owner',
    date: '2026-10-08',
    status: 'pending',
    user: { ...user },
    ...change,
  };
  const repo = {
    findOne: jest.fn().mockResolvedValue(digest),
    update: jest.fn(),
  };
  const runner = {
    connect: jest.fn(),
    release: jest.fn(),
    query: jest.fn().mockResolvedValue([{ locked: true }]),
    manager: { getRepository: () => repo },
  };
  const tasks = {
    findToday: jest.fn().mockResolvedValue({
      total: 4,
      completed: 1,
      items: [
        {
          title: '<script>test</script>',
          priority: 'HIGH',
          deadline: new Date('2026-10-08T10:00Z'),
          category: { name: 'Work' },
        },
      ],
    }),
  };
  const email = { send: jest.fn().mockResolvedValue(undefined) };
  const processor = new DailyDigestProcessor(
    { createQueryRunner: () => runner } as unknown as DataSource,
    tasks as unknown as TasksService,
    email as unknown as EmailProvider,
    config,
  );
  const job = {
    data: { digestId: 'digest' },
    token: 'lock',
    moveToDelayed: jest.fn(),
  };
  return {
    processor,
    repo,
    runner,
    tasks,
    email,
    job: job as unknown as Job<{ digestId: string }>,
    rawJob: job,
  };
}

describe('Daily digest', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-10-08T05:30:00Z'));
  });
  afterEach(() => jest.useRealTimers());
  it('sends one escaped grouped email with a stable idempotency key', async () => {
    const f = processorFixture();
    await f.processor.process(f.job);
    expect(f.email.send).toHaveBeenCalledTimes(1);
    expect(f.email.send).toHaveBeenCalledWith(
      user.email,
      expect.any(String),
      expect.stringContaining('&lt;script&gt;test&lt;/script&gt;'),
      'daily-digest',
    );
    expect(f.email.send.mock.calls[0][2]).toContain('Ta priorité du jour');
    expect(f.repo.update).toHaveBeenLastCalledWith('digest', {
      status: 'sent',
    });
    expect(f.runner.release).toHaveBeenCalled();
  });
  it.each([
    { status: 'sent' },
    { status: 'sending' },
    { status: 'uncertain' },
    { user: { ...user, notificationsEnabled: false } },
    { user: { ...user, dailyDigestEnabled: false } },
    { user: { ...user, notifChannels: [] } },
    { date: '2026-10-07' },
  ])('does not send when ineligible or already claimed: %j', async (change) => {
    const f = processorFixture(change);
    await f.processor.process(f.job);
    expect(f.email.send).not.toHaveBeenCalled();
  });
  it('skips empty days', async () => {
    const f = processorFixture();
    f.tasks.findToday.mockResolvedValue({ total: 0, completed: 0, items: [] });
    await f.processor.process(f.job);
    expect(f.email.send).not.toHaveBeenCalled();
    expect(f.repo.update).toHaveBeenLastCalledWith('digest', {
      status: 'skipped',
    });
  });
  it('rechecks quiet hours before delivery and delays without sending', async () => {
    const f = processorFixture({
      user: { ...user, quietHoursEnabled: true, quietHoursEnd: '09:00' },
    });
    await expect(f.processor.process(f.job)).rejects.toBeInstanceOf(
      DelayedError,
    );
    expect(f.rawJob.moveToDelayed).toHaveBeenCalledWith(
      Date.parse('2026-10-08T07:00Z'),
      'lock',
    );
    expect(f.email.send).not.toHaveBeenCalled();
  });
  it('does not catch up a morning digest paused until another local day', async () => {
    const f = processorFixture({
      user: {
        ...user,
        notificationsPausedUntil: new Date('2026-10-10T08:00Z'),
      },
    });
    await f.processor.process(f.job);
    expect(f.email.send).not.toHaveBeenCalled();
    expect(f.repo.update).toHaveBeenLastCalledWith(
      'digest',
      expect.objectContaining({ status: 'cancelled' }),
    );
  });
  it('records uncertainty on network failure and does not retry blindly', async () => {
    const f = processorFixture();
    f.email.send.mockRejectedValue(new Error('timeout'));
    await expect(f.processor.process(f.job)).rejects.toThrow('unconfirmed');
    expect(f.repo.update).toHaveBeenLastCalledWith(
      'digest',
      expect.objectContaining({ status: 'uncertain' }),
    );
  });
  it('plans a deterministic delayed job and avoids sending a late digest', async () => {
    const users = { find: jest.fn().mockResolvedValue([user]) };
    const insert = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    };
    const digests = {
      createQueryBuilder: () => insert,
      findOneBy: jest
        .fn()
        .mockResolvedValue({ id: 'digest', status: 'pending' }),
    };
    const queue = {
      add: jest.fn(),
      getJob: jest.fn().mockResolvedValue(undefined),
    };
    const scheduler = new DailyDigestScheduler(
      users as unknown as Repository<User>,
      digests as unknown as Repository<DailyDigest>,
      queue as unknown as Queue<{ digestId: string }>,
      config,
    );
    await scheduler.reconcile(new Date('2026-10-08T04:30Z'));
    expect(queue.add).toHaveBeenCalledWith(
      'morning',
      { digestId: 'digest' },
      expect.objectContaining({ jobId: 'digest', delay: 3600000 }),
    );
    queue.add.mockClear();
    digests.findOneBy.mockResolvedValue(null as never);
    await scheduler.reconcile(new Date('2026-10-08T06:30Z'));
    expect(queue.add).not.toHaveBeenCalled();
  });
});
