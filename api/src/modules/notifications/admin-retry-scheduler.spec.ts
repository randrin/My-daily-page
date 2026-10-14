import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { Task } from '@entities/task.entity';
import { Reminder } from '@entities/reminder.entity';
import {
  NotifChannel,
  Priority,
  ReminderStatus,
  TaskStatus,
} from '@entities/enums';
import { ReminderScheduler } from './reminder-scheduler';
import { NotificationJobPayload } from './interfaces/notification-job.interface';
function fixture(fails = false) {
  const job = {
    getState: jest.fn().mockResolvedValue('failed'),
    retry: jest
      .fn()
      .mockImplementation(() =>
        fails
          ? Promise.reject(new Error('Redis unavailable'))
          : Promise.resolve(),
      ),
  };
  const reminder = {
    id: 'reminder',
    channel: NotifChannel.EMAIL,
    status: ReminderStatus.PENDING,
    adminRetryRequestedAt: new Date(),
    triggerAt: new Date(Date.now() - 60000),
    task: {
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      deadline: new Date(Date.now() + 86400000),
      user: { notificationsEnabled: true, timezone: 'Europe/Paris' },
    },
  };
  const tasks = { find: jest.fn().mockResolvedValue([]) },
    reminders = {
      find: jest.fn().mockResolvedValue([reminder]),
      update: jest.fn(),
    };
  const queue = {
    getJob: jest.fn().mockResolvedValue(job),
    getJobs: jest.fn().mockResolvedValue([]),
    add: jest.fn(),
  };
  const scheduler = new ReminderScheduler(
    tasks as unknown as Repository<Task>,
    reminders as unknown as Repository<Reminder>,
    queue as unknown as Queue<NotificationJobPayload>,
    { get: () => true } as unknown as ConfigService,
  );
  return { job, queue, reminders, scheduler };
}
it('retries the existing failed job and clears the durable request only after handoff', async () => {
  const f = fixture();
  await f.scheduler.reconcile();
  expect(f.job.retry).toHaveBeenCalledWith('failed');
  expect(f.reminders.update).toHaveBeenCalledWith('reminder', {
    adminRetryRequestedAt: null,
  });
  expect(f.queue.add).not.toHaveBeenCalled();
});
it('preserves the request when Redis handoff fails', async () => {
  const f = fixture(true);
  await expect(f.scheduler.reconcile()).rejects.toThrow('Redis unavailable');
  expect(f.reminders.update).not.toHaveBeenCalled();
});
