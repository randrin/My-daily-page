import { randomUUID } from 'crypto';
import {
  DataSource,
  EntityManager,
  EntityTarget,
  ObjectLiteral,
  QueryRunner,
} from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Job, Queue } from 'bullmq';
import dataSource from '../../database/data-source';
import { Task } from '@entities/task.entity';
import { Reminder } from '@entities/reminder.entity';
import { Category } from '@entities/category.entity';
import { PersonalizationService } from './personalization.service';
import { CompanionProcessor, CompanionScheduler } from './companion-worker';
import { taskDefaults } from './defaults';
import { TasksService } from '../tasks/tasks.service';
import { FilesService } from '../files/files.service';
import { EmailProvider } from '../notifications/providers/email.provider';
const integration =
  process.env.PERSONALIZATION_DATABASE_TESTS === '1' ? describe : describe.skip;
integration('Personalization and consensual companion PostgreSQL', () => {
  let runner: QueryRunner,
    db: DataSource,
    service: PersonalizationService,
    owner: string,
    recipient: string,
    other: string;
  beforeAll(async () => {
    await dataSource.initialize();
  });
  beforeEach(async () => {
    runner = dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    owner = randomUUID();
    recipient = randomUUID();
    other = randomUUID();
    for (const id of [owner, recipient, other])
      await runner.query(
        "INSERT INTO users(id,email,password,first_name,notifications_enabled) VALUES($1,$2,'unused','Synthetic',false)",
        [id, `${id}@example.invalid`],
      );
    db = {
      getRepository: <T extends ObjectLiteral>(entity: EntityTarget<T>) =>
        runner.manager.getRepository(entity),
      query: <T>(sql: string, params?: unknown[]) =>
        runner.manager.query<T>(sql, params),
      transaction: <T>(fn: (m: EntityManager) => Promise<T>) =>
        runner.manager.transaction(fn),
      createQueryRunner: () => ({
        connect: () => Promise.resolve(),
        release: () => Promise.resolve(),
        query: <T>(sql: string, params?: unknown[]) =>
          runner.manager.query<T>(sql, params),
        manager: runner.manager,
      }),
    } as DataSource;
    service = new PersonalizationService(db);
  });
  afterEach(async () => {
    await runner.rollbackTransaction();
    await runner.release();
  });
  afterAll(async () => {
    await dataSource.destroy();
  });
  it('isolates defaults, snapshots the lead time and preserves explicit overrides/category removal', async () => {
    const category = randomUUID(),
      foreign = randomUUID();
    for (const [id, user] of [
      [category, owner],
      [foreign, other],
    ])
      await runner.query(
        "INSERT INTO categories(id,user_id,name,color) VALUES($1,$2,'Synthetic','#123456')",
        [id, user],
      );
    await expect(
      service.updateDefaults(owner, { ...taskDefaults, categoryId: foreign }),
    ).rejects.toThrow();
    await service.updateDefaults(owner, {
      ...taskDefaults,
      priority: 'high',
      categoryId: category,
      reminderLeadMinutes: 60,
      taskView: 'grid',
    });
    expect((await service.defaults(other)).priority).toBe('medium');
    const tasks = new TasksService(
      runner.manager.getRepository(Task),
      runner.manager.getRepository(Reminder),
      runner.manager.getRepository(Category),
      {
        normalizeOwnedUrl: jest.fn().mockResolvedValue(null),
      } as unknown as FilesService,
      service,
    );
    const task = await tasks.create(owner, {
      title: 'Synthetic',
      deadline: new Date(Date.now() + 86400000).toISOString(),
    });
    expect(task.priority).toBe('HIGH');
    expect(task.categoryId).toBe(category);
    expect(task.reminderLeadMinutes).toBe(60);
    const cleared = await tasks.update(task.id, owner, { categoryId: null });
    expect(cleared.categoryId).toBeNull();
    expect(cleared.category).toBeNull();
    const explicit = await tasks.create(owner, {
      title: 'Explicit',
      priority: 'LOW' as Task['priority'],
      categoryId: null,
      deadline: new Date(Date.now() + 86400000).toISOString(),
    });
    expect(explicit.categoryId).toBeNull();
    expect(explicit.priority).toBe('LOW');
    await service.updateDefaults(owner, {
      ...taskDefaults,
      reminderLeadMinutes: 120,
    });
    expect(
      (
        await runner.manager
          .getRepository(Task)
          .findOneByOrFail({ id: task.id })
      ).reminderLeadMinutes,
    ).toBe(60);
    await service.updateDefaults(owner, {
      ...taskDefaults,
      categoryId: category,
    });
    await runner.query('DELETE FROM categories WHERE id=$1', [category]);
    expect((await service.defaults(owner)).categoryId).toBeNull();
  });
  it('observes only opted-in real completions, deduplicates reopened tasks and clears observations on opt-out', async () => {
    const first = randomUUID();
    await runner.query(
      "INSERT INTO tasks(id,user_id,title) VALUES($1,$2,'Synthetic')",
      [first, owner],
    );
    await runner.query("UPDATE tasks SET status='DONE' WHERE id=$1", [first]);
    expect((await service.energy(owner)).total).toBe(0);
    await service.setEnergy(owner, true);
    for (let i = 0; i < 5; i++) {
      const id = randomUUID();
      await runner.query(
        "INSERT INTO tasks(id,user_id,title) VALUES($1,$2,'Synthetic')",
        [id, owner],
      );
      await runner.query("UPDATE tasks SET status='DONE' WHERE id=$1", [id]);
      await runner.query("UPDATE tasks SET status='TODO' WHERE id=$1", [id]);
      await runner.query("UPDATE tasks SET status='DONE' WHERE id=$1", [id]);
      await runner.query(
        "UPDATE task_completion_events SET completed_at=date_trunc('day',now())-($2::int*interval '1 day')+interval '10 hours' WHERE task_id=$1",
        [id, i % 3],
      );
    }
    const energy = await service.energy(owner);
    expect(energy.total).toBe(5);
    expect(energy.days).toBe(3);
    expect(energy.suggestions).toHaveLength(1);
    expect((await service.energy(other)).total).toBe(0);
    await service.setEnergy(owner, false);
    await service.setEnergy(owner, true);
    expect((await service.energy(owner)).total).toBe(0);
  });
  it('requires the intended account and explicit consent, prevents token replay and supports bilateral withdrawal', async () => {
    await expect(
      service.invite(owner, {
        email: `${recipient}@example.invalid`,
        consent: false,
      }),
    ).rejects.toThrow();
    const invite = await service.invite(owner, {
      email: `${recipient}@example.invalid`,
      consent: true,
    });
    const [stored] = await runner.manager.query<{ token_hash: string }[]>(
      'SELECT token_hash FROM accountability_pairs WHERE id=$1',
      [invite.id],
    );
    expect(stored.token_hash).not.toBe(invite.token);
    await expect(service.invitation(other, invite.token)).rejects.toThrow();
    await expect(service.respond(other, invite.token, true)).rejects.toThrow();
    expect((await service.invitation(recipient, invite.token)).id).toBe(
      invite.id,
    );
    await service.respond(recipient, invite.token, true);
    await expect(
      service.respond(recipient, invite.token, true),
    ).rejects.toThrow();
    await expect(service.updatePair(other, invite.id, false)).rejects.toThrow();
    await service.updatePair(recipient, invite.id, false);
    expect((await service.pairs(recipient))[0].enabled).toBe(false);
    await service.updatePair(recipient, invite.id, null);
    expect((await service.pairs(owner))[0].status).toBe('revoked');
  });
  it('delivers one minimal email with a fake provider and never blindly repeats an uncertain send', async () => {
    const invitation = await service.invite(owner, {
      email: `${recipient}@example.invalid`,
      consent: true,
    });
    await service.respond(recipient, invitation.token, true);
    for (const id of [owner, recipient]) {
      await runner.query(
        'UPDATE users SET notifications_enabled=true WHERE id=$1',
        [id],
      );
      await runner.query(
        "INSERT INTO notification_preferences(user_id,channel,enabled) VALUES($1,'EMAIL',true)",
        [id],
      );
    }
    for (let i = 0; i < 2; i++)
      await runner.query(
        "INSERT INTO tasks(user_id,title,deadline) VALUES($1,'PRIVATE TITLE',now()-interval '2 days')",
        [owner],
      );
    const added: { id: string }[] = [],
      queue = {
        add: jest
          .fn()
          .mockImplementation((_name: string, data: { id: string }) => {
            added.push(data);
            return Promise.resolve();
          }),
      } as unknown as Queue;
    const config = new ConfigService({
      notifications: { enabled: true, appUrl: 'https://example.invalid' },
    });
    await new CompanionScheduler(db, queue, config).reconcile();
    expect(added.length).toBeGreaterThan(0);
    const [delivery] = await runner.manager.query<{ id: string }[]>(
      'SELECT id FROM accountability_deliveries WHERE pair_id=$1',
      [invitation.id],
    );
    const email = {
      send: jest
        .fn()
        .mockResolvedValue({ provider: 'resend', messageId: 'synthetic-id' }),
    };
    const worker = new CompanionProcessor(
      db,
      email as unknown as EmailProvider,
      config,
    );
    const job = { data: { id: delivery.id } } as Job<{ id: string }>;
    await worker.process(job);
    await worker.process(job);
    expect(email.send).toHaveBeenCalledTimes(1);
    expect(email.send).toHaveBeenCalledWith(
      `${recipient}@example.invalid`,
      expect.any(String),
      expect.not.stringContaining('PRIVATE TITLE'),
      expect.any(String),
    );
    await runner.query(
      "UPDATE accountability_deliveries SET status='sending' WHERE id=$1",
      [delivery.id],
    );
    await worker.process(job);
    expect(email.send).toHaveBeenCalledTimes(1);
    const [result] = await runner.manager.query<{ status: string }[]>(
      'SELECT status FROM accountability_deliveries WHERE id=$1',
      [delivery.id],
    );
    expect(result.status).toBe('uncertain');
  });
  it('rechecks revocation before a queued email', async () => {
    const invite = await service.invite(owner, {
      email: `${recipient}@example.invalid`,
      consent: true,
    });
    await service.respond(recipient, invite.token, true);
    const id = randomUUID();
    await runner.query(
      'INSERT INTO accountability_deliveries(id,pair_id,local_day) VALUES($1,$2,current_date)',
      [id, invite.id],
    );
    await service.updatePair(owner, invite.id, null);
    const email = { send: jest.fn() };
    await new CompanionProcessor(
      db,
      email as unknown as EmailProvider,
      new ConfigService({ notifications: { enabled: true } }),
    ).process({ data: { id } } as Job<{ id: string }>);
    expect(email.send).not.toHaveBeenCalled();
  });
});
