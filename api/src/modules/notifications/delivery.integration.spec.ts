// Opt in with P2_DATABASE_TESTS=1. Uses a disposable isolated PostgreSQL schema; no provider calls.
import { config } from 'dotenv';
import { randomUUID } from 'crypto';
import { createServer, request } from 'http';
import { DataSource, QueryRunner } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import type { Job, Queue } from 'bullmq';
import { DeliveryService } from './delivery.service';
import { SmsOverflowService, SmsOverflowProcessor } from './sms-overflow';
import { EmailProvider } from './providers/email.provider';

const run = process.env.P2_DATABASE_TESTS === '1' ? describe : describe.skip;
run('PostgreSQL multi-worker delivery and overflow', () => {
  const schema = `notification_test_${randomUUID().replace(/-/g, '')}`;
  let source: DataSource;
  let admin: DataSource;
  let delivery: DeliveryService;
  let collector: SmsOverflowService;
  const userId = randomUUID();
  const settings = new ConfigService({
    notifications: { enabled: true, appUrl: 'https://app.example.com' },
  });
  beforeAll(async () => {
    config({ quiet: true });
    admin = await new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL,
    }).initialize();
    await admin.query(`CREATE SCHEMA "${schema}"`);
    source = await new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      extra: { options: `-c search_path=${schema}`, max: 30 },
    }).initialize();
    await source.query(
      `CREATE TABLE reminders(id uuid PRIMARY KEY,status varchar,delivery_status varchar,delivery_error varchar,provider varchar,provider_message_id varchar,sent_at timestamptz,last_error text,task_id uuid,trigger_at timestamptz DEFAULT now()); CREATE TABLE tasks(id uuid PRIMARY KEY,title varchar,deadline timestamptz,status varchar); CREATE TABLE sms_overflow_digests(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid,date date,status varchar DEFAULT 'pending',snapshot jsonb,provider varchar,provider_message_id varchar,delivery_status varchar,last_error text,UNIQUE(user_id,date)); CREATE TABLE sms_overflow_items(reminder_id uuid PRIMARY KEY,digest_id uuid); CREATE TABLE notification_delivery_events(provider varchar,event_id varchar,message_id varchar,status varchar,rank integer,error varchar,created_at timestamptz DEFAULT now(),PRIMARY KEY(provider,event_id));`,
    );
    delivery = new DeliveryService(source);
    collector = new SmsOverflowService(
      source,
      {} as Queue<{ id: string }>,
      settings,
    );
  });
  afterAll(async () => {
    if (source?.isInitialized) await source.destroy();
    if (admin?.isInitialized) {
      await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
      await admin.destroy();
    }
  });
  it('collects concurrent overflow reminders and replay into a single durable digest', async () => {
    const ids = Array.from({ length: 15 }, () => randomUUID());
    for (const id of ids) {
      const task = randomUUID();
      await source.query("INSERT INTO tasks VALUES($1,'Task',now(),'TODO')", [
        task,
      ]);
      await source.query(
        "INSERT INTO reminders(id,task_id,status) VALUES($1,$2,'SENDING')",
        [id, task],
      );
    }
    await Promise.all(
      [...ids, ids[0], ids[1]].map((id) =>
        collector.collect(id, userId, '2020-01-01'),
      ),
    );
    const [counts] = await source.query<{ digests: number; items: number }[]>(
      'SELECT (SELECT count(*) FROM sms_overflow_digests)::int digests,(SELECT count(*) FROM sms_overflow_items)::int items',
    );
    expect(counts).toEqual({ digests: 1, items: 15 });
  });
  it('handles early callbacks, replay and out-of-order delivery concurrently', async () => {
    const id = randomUUID();
    await source.query(
      "INSERT INTO reminders(id,status) VALUES($1,'SENDING')",
      [id],
    );
    await delivery.event('twilio', 'early', 'message', 'delivered');
    await delivery.bind(id, { provider: 'twilio', messageId: 'message' });
    await Promise.all(
      Array.from({ length: 15 }, (_, i) =>
        delivery.event(
          'twilio',
          `event-${i % 3}`,
          'message',
          i % 2 ? 'sent' : 'read',
        ),
      ),
    );
    const [r] = await source.query<{ delivery_status: string }[]>(
      'SELECT delivery_status FROM reminders WHERE id=$1',
      [id],
    );
    expect(r.delivery_status).toBe('read');
    const [count] = await source.query<{ count: number }[]>(
      'SELECT count(*)::int count FROM notification_delivery_events',
    );
    expect(count.count).toBe(4);
  });
  it('allows only one worker to send and never resends after a simulated crash', async () => {
    const [digest] = await source.query<{ id: string }[]>(
      'SELECT id FROM sms_overflow_digests LIMIT 1',
    );
    const original = (): QueryRunner =>
      DataSource.prototype.createQueryRunner.call(source) as QueryRunner;
    const spy = jest
      .spyOn(source, 'createQueryRunner')
      .mockImplementation(() => {
        const runner = original();
        jest.spyOn(runner.manager, 'getRepository').mockReturnValue({
          findOne: () =>
            Promise.resolve({
              email: 'test@example.com',
              timezone: 'Europe/Paris',
              notificationsEnabled: true,
              quietHoursEnabled: false,
              notifChannels: [{ channel: 'EMAIL', enabled: true }],
            }),
        } as never);
        return runner;
      });
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    let started!: () => void;
    const ready = new Promise<void>((resolve) => {
      started = resolve;
    });
    const send = jest.fn().mockImplementation(async () => {
      started();
      await gate;
      return { provider: 'resend', messageId: 'digest-email' };
    });
    const worker = new SmsOverflowProcessor(
      source,
      settings,
      { send } as unknown as EmailProvider,
      delivery,
    );
    const job = { data: { id: digest.id } } as Job<{ id: string }>;
    const first = worker.process(job);
    await ready;
    const second = new SmsOverflowProcessor(
      source,
      settings,
      { send } as unknown as EmailProvider,
      delivery,
    );
    await expect(second.process(job)).rejects.toThrow(
      'already being processed',
    );
    release();
    await first;
    await worker.process(job);
    expect(send).toHaveBeenCalledTimes(1);
    // A lost worker after entering sending must not cause an automatic second email.
    await source.query("UPDATE sms_overflow_digests SET status='sending'");
    await worker.process(job);
    expect(send).toHaveBeenCalledTimes(1);
    const [row] = await source.query<{ status: string }[]>(
      'SELECT status FROM sms_overflow_digests',
    );
    expect(row.status).toBe('uncertain');
    spy.mockRestore();
  });
  it('does not resend when a real local HTTP connection drops after accepting the request', async () => {
    const [digest] = await source.query<{ id: string }[]>(
      'SELECT id FROM sms_overflow_digests LIMIT 1',
    );
    await source.query("UPDATE sms_overflow_digests SET status='pending'");
    const server = createServer((req) => {
      req.socket.destroy();
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('No local port');
    const send = jest.fn(
      () =>
        new Promise<never>((_, reject) => {
          const req = request(
            { host: '127.0.0.1', port: address.port, method: 'POST' },
            () => reject(new Error('Unexpected response')),
          );
          req.on('error', reject);
          req.end('test');
        }),
    );
    const original = (): QueryRunner =>
      DataSource.prototype.createQueryRunner.call(source) as QueryRunner;
    const spy = jest
      .spyOn(source, 'createQueryRunner')
      .mockImplementation(() => {
        const runner = original();
        jest.spyOn(runner.manager, 'getRepository').mockReturnValue({
          findOne: () =>
            Promise.resolve({
              email: 'test@example.com',
              timezone: 'Europe/Paris',
              notificationsEnabled: true,
              quietHoursEnabled: false,
              notifChannels: [{ channel: 'EMAIL', enabled: true }],
            }),
        } as never);
        return runner;
      });
    try {
      const worker = new SmsOverflowProcessor(
        source,
        settings,
        { send } as unknown as EmailProvider,
        delivery,
      );
      const job = {
        data: { id: digest.id },
        attemptsMade: 0,
        opts: { attempts: 3 },
      } as Job<{ id: string }>;
      await expect(worker.process(job)).rejects.toMatchObject({
        code: 'ECONNRESET',
      });
      await worker.process(job);
      expect(send).toHaveBeenCalledTimes(1);
      const [row] = await source.query<{ status: string }[]>(
        'SELECT status FROM sms_overflow_digests',
      );
      expect(row.status).toBe('uncertain');
    } finally {
      spy.mockRestore();
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });
});
