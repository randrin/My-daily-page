/** Local PostgreSQL + Redis integration; providers are simulated, no external message. */
import 'reflect-metadata';
import { randomUUID } from 'crypto';
import { Job, Queue, Worker } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import source from '../src/database/data-source';
import { Task } from '../src/entities/task.entity';
import { User } from '../src/entities/user.entity';
import { Reminder } from '../src/entities/reminder.entity';
import { NotificationPreference } from '../src/entities/notification-preference.entity';
import {
  NotifChannel,
  Priority,
  ReminderStatus,
  TaskStatus,
} from '../src/entities/enums';
import { ReminderScheduler } from '../src/modules/notifications/reminder-scheduler';
import { NotificationProcessor } from '../src/modules/notifications/processors/notification.processor';
import { EmailProvider } from '../src/modules/notifications/providers/email.provider';
import { SmsProvider } from '../src/modules/notifications/providers/sms.provider';
import { WhatsappProvider } from '../src/modules/notifications/providers/whatsapp.provider';
import { NotificationJobPayload } from '../src/modules/notifications/interfaces/notification-job.interface';
import { strict as assert } from 'assert';

async function main() {
  await source.initialize();
  const userRepo = source.getRepository(User),
    taskRepo = source.getRepository(Task),
    reminderRepo = source.getRepository(Reminder);
  const user = await userRepo.save(
    userRepo.create({
      email: `p2-${randomUUID()}@example.com`,
      notificationsEnabled: true,
      firstName: 'Test',
      lastName: 'P2',
      password: 'unused-test-password',
      timezone: 'Europe/Paris',
    }),
  );
  const connection = {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
  };
  const queue = new Queue<NotificationJobPayload>(`p2-test-${randomUUID()}`, {
    connection,
  });
  const workers: Worker[] = [];
  try {
    await source
      .getRepository(NotificationPreference)
      .save({ userId: user.id, channel: NotifChannel.EMAIL, enabled: true });
    const task = await taskRepo.save(
      taskRepo.create({
        userId: user.id,
        title: 'P2 simulated reminder',
        priority: Priority.MEDIUM,
        status: TaskStatus.TODO,
        deadline: new Date(Date.now() + 4000),
      }),
    );
    const config = new ConfigService({
      notifications: {
        enabled: true,
        appUrl: 'http://localhost:3000',
        apiUrl: 'http://localhost:5500',
      },
      jwt: { secret: 'local-test-secret' },
    });
    // Scope the reconciler to this test user; existing application reminders remain untouched.
    const scopedTasks = {
      find: () =>
        taskRepo.find({
          where: { userId: user.id },
          relations: { user: { notifChannels: true } },
        }),
    } as unknown as typeof taskRepo;
    const scopedReminders = {
      find: () =>
        reminderRepo.find({
          where: { task: { userId: user.id }, status: ReminderStatus.PENDING },
          relations: { task: { user: true } },
        }),
      createQueryBuilder: () => reminderRepo.createQueryBuilder(),
      update: (...args: Parameters<typeof reminderRepo.update>) =>
        reminderRepo.update(...args),
      existsBy: (...args: Parameters<typeof reminderRepo.existsBy>) =>
        reminderRepo.existsBy(...args),
    } as unknown as typeof reminderRepo;
    const scheduler = new ReminderScheduler(
      scopedTasks,
      scopedReminders,
      queue,
      config,
    );
    let sent = 0;
    const email = {
      send: () => {
        sent++;
        return Promise.resolve();
      },
    } as unknown as EmailProvider;
    const reject = {
      send: () => Promise.reject(new Error('Unexpected test channel')),
    };
    const processor = new NotificationProcessor(
      source,
      config,
      queue,
      email,
      reject as unknown as SmsProvider,
      reject as unknown as WhatsappProvider,
    );
    await scheduler.reconcile();
    await scheduler.reconcile();
    const planned = await reminderRepo.find({ where: { taskId: task.id } });
    assert.equal(
      planned.length,
      1,
      'No duplicated reminder during reconciliation',
    );
    const queued = await queue.getJob(planned[0].id);
    assert.ok(queued);
    assert.equal(await queued.getState(), 'delayed');
    // Duplicate jobs deliberately model replay/stalled delivery across two workers.
    await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        queue.add('stress-replay', queued.data, {
          jobId: `stress-${i}`,
          delay: Math.max(0, task.deadline.getTime() - Date.now()),
          attempts: 10,
          backoff: { type: 'fixed', delay: 100 },
        }),
      ),
    );
    for (let i = 0; i < 2; i++)
      workers.push(
        new Worker<NotificationJobPayload>(
          queue.name,
          (job) => processor.process(job),
          { connection, concurrency: 5 },
        ),
      );
    const deadline = Date.now() + 15000;
    while (
      (await reminderRepo.findOneByOrFail({ id: planned[0].id })).status !==
        ReminderStatus.SENT &&
      Date.now() < deadline
    )
      await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(
      (await reminderRepo.findOneByOrFail({ id: planned[0].id })).status,
      ReminderStatus.SENT,
    );
    assert.equal(sent, 1);
    await processor.process(queued);
    assert.equal(sent, 1, 'Replay cannot send a second message');
    await taskRepo.update(task.id, { deadline: new Date(Date.now() + 60000) });
    await scheduler.reconcile();
    const future = await reminderRepo.findOneByOrFail({
      taskId: task.id,
      status: ReminderStatus.PENDING,
    });
    await userRepo.update(user.id, { notificationsEnabled: false });
    await scheduler.reconcile();
    assert.equal(
      (await reminderRepo.findOneByOrFail({ id: future.id })).status,
      ReminderStatus.CANCELLED,
    );
    assert.equal(await queue.getJob(future.id), undefined);
    // Even a previously queued job cannot deliver while the user's switch is off.
    await reminderRepo.update(future.id, { status: ReminderStatus.PENDING });
    await processor.process({
      data: { reminderId: future.id },
      attemptsMade: 0,
    } as Job<NotificationJobPayload>);
    assert.equal(sent, 1);
    assert.equal(
      (await reminderRepo.findOneByOrFail({ id: future.id })).status,
      ReminderStatus.CANCELLED,
    );
    await userRepo.update(user.id, { notificationsEnabled: true });
    await scheduler.reconcile();
    assert.equal(
      (await reminderRepo.findOneByOrFail({ id: future.id })).status,
      ReminderStatus.PENDING,
    );
    assert.ok(await queue.getJob(future.id));
    await taskRepo.update(task.id, { status: TaskStatus.DONE });
    await scheduler.reconcile();
    assert.equal(
      (await reminderRepo.findOneByOrFail({ id: future.id })).status,
      ReminderStatus.CANCELLED,
    );
    assert.equal(await queue.getJob(future.id), undefined);
    console.log(
      'P2 integration passed: two BullMQ workers + 20 replays → persisted plan → delayed Redis job → simulated provider → SENT → replay ignored → DONE cancels remaining jobs',
    );
  } finally {
    await Promise.all(workers.map((worker) => worker.close()));
    await queue.obliterate({ force: true });
    await queue.close();
    await userRepo.delete(user.id);
    await source.destroy();
  }
}
void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
