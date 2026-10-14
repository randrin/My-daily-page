import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import dataSource from '../../database/data-source';
import { AssistantService } from './assistant.service';
import { TasksService } from '../tasks/tasks.service';
import { Priority } from '@entities/enums';
const integration =
  process.env.ASSISTANT_DATABASE_TESTS === '1' ? describe : describe.skip;
integration('Assistant PostgreSQL confirmation', () => {
  const userId = randomUUID(),
    otherId = randomUUID();
  let service: AssistantService;
  beforeAll(async () => {
    await dataSource.initialize();
    for (const id of [userId, otherId])
      await dataSource.query(
        'INSERT INTO users(id,email,password,notifications_enabled) VALUES($1,$2,$3,false)',
        [id, `${id}@example.invalid`, 'unused'],
      );
    service = new AssistantService(
      dataSource,
      new ConfigService(),
      {} as TasksService,
    );
  });
  afterAll(async () => {
    if (dataSource.isInitialized) {
      await dataSource.query('DELETE FROM users WHERE id = ANY($1)', [
        [userId, otherId],
      ]);
      await dataSource.destroy();
    }
  });
  const input = () => ({
    tasks: [
      {
        title: 'Reviewed task',
        deadline: new Date(Date.now() + 86400000).toISOString(),
        priority: Priority.HIGH,
      },
    ],
  });
  it('creates no tasks before confirmation, isolates accounts, and creates only once concurrently', async () => {
    const draft = await service.suggest(userId, {
      text: 'Préparer; Vérifier',
      provider: 'guided',
      mode: 'breakdown',
      source: 'email',
    });
    expect(draft.items.every((item) => item.deadline === null)).toBe(true);
    expect(await service.drafts(otherId)).toHaveLength(0);
    await expect(service.confirm(otherId, draft.id, input())).rejects.toThrow(
      'introuvable',
    );
    const before: { count: number }[] = await dataSource.query(
      'SELECT count(*)::int count FROM tasks WHERE user_id=$1',
      [userId],
    );
    expect(before[0].count).toBe(0);
    const results = await Promise.all([
      service.confirm(userId, draft.id, input()),
      service.confirm(userId, draft.id, input()),
    ]);
    expect(results.map((result) => result.replayed).sort()).toEqual([
      false,
      true,
    ]);
    const after: { count: number }[] = await dataSource.query(
      'SELECT count(*)::int count FROM tasks WHERE user_id=$1',
      [userId],
    );
    expect(after[0].count).toBe(1);
    expect(await service.drafts(userId)).toHaveLength(0);
  });
  it('preserves unselected proposals for a later confirmation', async () => {
    const draft = await service.suggest(userId, {
      text: 'Étape A; Étape B',
      provider: 'guided',
      mode: 'breakdown',
      source: 'manual',
    });
    await service.confirm(userId, draft.id, {
      ...input(),
      selectedIndices: [0],
    });
    const pending = (await service.drafts(userId)) as {
      items: { title: string }[];
    }[];
    expect(pending.some((row) => row.items[0].title === 'Étape B')).toBe(true);
  });
  it('rejects past deadlines and blank content', async () => {
    await expect(
      service.suggest(userId, {
        text: '   ',
        provider: 'guided',
        mode: 'capture',
        source: 'manual',
      }),
    ).rejects.toThrow();
    const draft = await service.suggest(userId, {
      text: 'Lire',
      provider: 'guided',
      mode: 'capture',
      source: 'manual',
    });
    await expect(
      service.confirm(userId, draft.id, {
        tasks: [
          {
            title: 'Lire',
            priority: Priority.LOW,
            deadline: '2000-01-01T12:00:00Z',
          },
        ],
      }),
    ).rejects.toThrow('future');
  });
});
