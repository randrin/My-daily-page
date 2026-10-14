import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AdminAnalyticsDto } from './dto/admin-analytics.dto';
export function comparison(current: number, previous: number | null) {
  return {
    current,
    previous,
    change: previous === null ? null : current - previous,
    percent:
      previous === null || previous === 0
        ? null
        : Math.round(((current - previous) / previous) * 1000) / 10,
  };
}
@Injectable()
export class AdminAnalyticsService {
  constructor(private readonly db: DataSource) {}
  async overview(input: AdminAnalyticsDto) {
    const bounds = await this.db.query<
      {
        start: Date;
        end: Date;
        previousStart: Date;
        previousEnd: Date;
        measurementStartedAt: Date;
      }[]
    >(
      `SELECT (date_trunc('day',now() AT TIME ZONE $1)-($2::int-1)*interval '1 day') AT TIME ZONE $1 AS start,now() AS end,(date_trunc('day',now() AT TIME ZONE $1)-($2::int*2-1)*interval '1 day') AT TIME ZONE $1 AS "previousStart",(date_trunc('day',now() AT TIME ZONE $1)-($2::int-1)*interval '1 day') AT TIME ZONE $1 AS "previousEnd",started_at AS "measurementStartedAt" FROM user_activity_measurement WHERE id=1`,
      [input.timezone, input.days],
    );
    const range = bounds[0];
    const args = [
      input.timezone,
      range.previousStart,
      range.end,
      range.measurementStartedAt,
    ];
    const [rows, counts] = await Promise.all([
      this.db.query<
        {
          date: string;
          signups: number;
          activeUsers: number | null;
          actions: number | null;
        }[]
      >(
        `WITH calendar AS (SELECT generate_series(($2::timestamptz AT TIME ZONE $1)::date,($3::timestamptz AT TIME ZONE $1)::date,interval '1 day')::date AS day), signups AS (SELECT (created_at AT TIME ZONE current_setting('TimeZone') AT TIME ZONE $1)::date AS day,count(*)::int AS count FROM users WHERE created_at >= ($2::timestamptz AT TIME ZONE current_setting('TimeZone')) AND created_at <= ($3::timestamptz AT TIME ZONE current_setting('TimeZone')) GROUP BY day), activity AS (SELECT (occurred_at AT TIME ZONE $1)::date AS day,count(DISTINCT user_id)::int AS users,count(*)::int AS actions FROM user_activity_events WHERE occurred_at >= $2 AND occurred_at <= $3 GROUP BY day) SELECT to_char(c.day,'YYYY-MM-DD') AS date,COALESCE(s.count,0) AS signups,CASE WHEN c.day < ($4::timestamptz AT TIME ZONE $1)::date THEN NULL ELSE COALESCE(a.users,0) END AS "activeUsers",CASE WHEN c.day < ($4::timestamptz AT TIME ZONE $1)::date THEN NULL ELSE COALESCE(a.actions,0) END AS actions FROM calendar c LEFT JOIN signups s ON s.day=c.day LEFT JOIN activity a ON a.day=c.day ORDER BY c.day`,
        args,
      ),
      this.db.query<{ current: number; previous: number }[]>(
        `SELECT count(DISTINCT user_id) FILTER(WHERE occurred_at >= $1 AND occurred_at <= $2)::int AS current,count(DISTINCT user_id) FILTER(WHERE occurred_at >= $3 AND occurred_at < $1)::int AS previous FROM user_activity_events WHERE occurred_at >= $3 AND occurred_at <= $2`,
        [range.start, range.end, range.previousStart],
      ),
    ]);
    const current = rows.slice(-input.days),
      previous = rows.slice(0, input.days);
    const sum = (items: typeof rows, key: 'signups' | 'actions') =>
      items.reduce((total, row) => total + (row[key] ?? 0), 0);
    const activityComparable =
      range.measurementStartedAt <= range.previousStart;
    return {
      ...range,
      days: input.days,
      timezone: input.timezone,
      activityComparable,
      activityComplete: range.measurementStartedAt <= range.start,
      summary: {
        signups: comparison(sum(current, 'signups'), sum(previous, 'signups')),
        activeUsers: comparison(
          counts[0].current,
          activityComparable ? counts[0].previous : null,
        ),
        actions: comparison(
          sum(current, 'actions'),
          activityComparable ? sum(previous, 'actions') : null,
        ),
      },
      series: current,
    };
  }
}
