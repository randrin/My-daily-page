import { randomUUID } from 'crypto';
import { DataSource, QueryRunner } from 'typeorm';
import dataSource from '../../database/data-source';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AdminAnalyticsDto } from './dto/admin-analytics.dto';
const integration =
  process.env.ADMIN_ANALYTICS_DATABASE_TESTS === '1' ? describe : describe.skip;
integration('Usage curves PostgreSQL', () => {
  let runner: QueryRunner, service: AdminAnalyticsService;
  const alpha = randomUUID(),
    beta = randomUUID();
  beforeAll(async () => {
    await dataSource.initialize();
  });
  beforeEach(async () => {
    runner = dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    for (const id of [alpha, beta])
      await runner.query(
        "INSERT INTO users(id,email,password,notifications_enabled) VALUES($1,$2,'unused',false)",
        [id, `${id}@example.invalid`],
      );
    service = new AdminAnalyticsService({
      query: <T>(sql: string, params?: unknown[]) =>
        runner.manager.query<T>(sql, params),
    } as DataSource);
  });
  afterEach(async () => {
    await runner.rollbackTransaction();
    await runner.release();
  });
  afterAll(async () => {
    await dataSource.destroy();
  });
  it('deduplicates active users across multiple days, compares previous periods and fills missing days', async () => {
    await runner.query(
      "UPDATE user_activity_measurement SET started_at=now()-interval '200 days' WHERE id=1",
    );
    const input = Object.assign(new AdminAnalyticsDto(), {
      days: 7,
      timezone: 'Europe/Paris',
    });
    const before = await service.overview(input);
    await runner.query(
      "INSERT INTO user_activity_events(user_id,kind,occurred_at) VALUES($1,'tasks',now()-interval '1 second'),($1,'tasks',now()-interval '1 day'),($1,'categories',now()-interval '2 days'),($2,'templates',now()-interval '1 second'),($1,'tasks',now()-interval '8 days')",
      [alpha, beta],
    );
    const after = await service.overview(input);
    expect(after.series).toHaveLength(7);
    expect(
      after.summary.activeUsers.current - before.summary.activeUsers.current,
    ).toBe(2);
    expect(after.summary.actions.current - before.summary.actions.current).toBe(
      4,
    );
    expect(
      after.summary.activeUsers.previous - before.summary.activeUsers.previous,
    ).toBe(1);
    expect(after.activityComparable).toBe(true);
    expect(after.series.every((row) => row.activeUsers !== null)).toBe(true);
  });
  it('marks dates before instrumentation as unmeasured and suppresses invalid comparisons', async () => {
    await runner.query(
      'UPDATE user_activity_measurement SET started_at=now() WHERE id=1',
    );
    const result = await service.overview(new AdminAnalyticsDto());
    expect(result.series[0].activeUsers).toBeNull();
    expect(result.activityComparable).toBe(false);
    expect(result.summary.activeUsers.previous).toBeNull();
    expect(result.summary.actions.percent).toBeNull();
  });
  it('groups historical signups by the requested timezone around midnight', async () => {
    const rows = await runner.manager.query<{ instant: Date }[]>(
      "SELECT date_trunc('day',now()-interval '1 day')+interval '23 hours 30 minutes' AS instant",
    );
    await runner.query(
      "UPDATE users SET created_at=$2::timestamptz AT TIME ZONE current_setting('TimeZone') WHERE id=$1",
      [alpha, rows[0].instant],
    );
    const paris = await service.overview(
      Object.assign(new AdminAnalyticsDto(), {
        days: 7,
        timezone: 'Europe/Paris',
      }),
    );
    const utc = await service.overview(
      Object.assign(new AdminAnalyticsDto(), { days: 7, timezone: 'UTC' }),
    );
    const utcDay = rows[0].instant.toISOString().slice(0, 10);
    const nextDay = new Date(rows[0].instant.getTime() + 86400000)
      .toISOString()
      .slice(0, 10);
    const baselineParis = paris.series.find(
      (row) => row.date === nextDay,
    ).signups;
    const baselineUtc = utc.series.find((row) => row.date === utcDay).signups;
    await runner.query('DELETE FROM users WHERE id=$1', [alpha]);
    const afterParis = await service.overview(
      Object.assign(new AdminAnalyticsDto(), {
        days: 7,
        timezone: 'Europe/Paris',
      }),
    );
    const afterUtc = await service.overview(
      Object.assign(new AdminAnalyticsDto(), { days: 7, timezone: 'UTC' }),
    );
    expect(
      baselineParis -
        afterParis.series.find((row) => row.date === nextDay).signups,
    ).toBe(1);
    expect(
      baselineUtc - afterUtc.series.find((row) => row.date === utcDay).signups,
    ).toBe(1);
  });
});
