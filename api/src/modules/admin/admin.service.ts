import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@entities/user.entity';
import { AdminUsersDto } from './dto/admin-users.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}
  async overview() {
    const rows: Record<string, number>[] = await this.users.query(`SELECT
      (SELECT count(*)::int FROM users) AS users,
      (SELECT count(*)::int FROM users WHERE created_at >= NOW() - INTERVAL '30 days') AS "newUsers",
      (SELECT count(*)::int FROM users WHERE notifications_enabled) AS "notificationsEnabled",
      (SELECT count(*)::int FROM tasks) AS tasks,
      (SELECT count(*)::int FROM tasks WHERE status = 'DONE') AS "completedTasks",
      (SELECT count(*)::int FROM reminders WHERE status = 'FAILED') AS "failedReminders"`);
    return rows[0];
  }
  async list(dto: AdminUsersDto) {
    const query = this.users
      .createQueryBuilder('u')
      .select([
        'u.id',
        'u.email',
        'u.firstName',
        'u.lastName',
        'u.role',
        'u.timezone',
        'u.createdAt',
        'u.notificationsEnabled',
        'u.dailyDigestEnabled',
      ]);
    if (dto.search?.trim()) {
      const escaped = dto.search.trim().replace(/[\\%_]/g, '\\$&');
      query.andWhere(
        '(u.email ILIKE :search OR u.firstName ILIKE :search OR u.lastName ILIKE :search)',
        { search: `%${escaped}%` },
      );
    }
    if (dto.role) query.andWhere('u.role = :role', { role: dto.role });
    const total = await query.getCount();
    const users = await query
      .orderBy('u.createdAt', 'DESC')
      .addOrderBy('u.id', 'ASC')
      .skip((dto.page - 1) * dto.pageSize)
      .take(dto.pageSize)
      .getMany();
    const ids = users.map((u) => u.id);
    const counts: { userId: string; tasks: number; completedTasks: number }[] =
      ids.length
        ? await this.users.query(
            `SELECT user_id AS "userId", count(*)::int AS tasks, count(*) FILTER (WHERE status = 'DONE')::int AS "completedTasks" FROM tasks WHERE user_id = ANY($1::uuid[]) GROUP BY user_id`,
            [ids],
          )
        : [];
    const byUser = new Map(counts.map((row) => [row.userId, row]));
    return {
      items: users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        timezone: user.timezone,
        createdAt: user.createdAt,
        notificationsEnabled: user.notificationsEnabled,
        dailyDigestEnabled: user.dailyDigestEnabled,
        tasks: byUser.get(user.id)?.tasks ?? 0,
        completedTasks: byUser.get(user.id)?.completedTasks ?? 0,
      })),
      total,
      page: dto.page,
      pageSize: dto.pageSize,
    };
  }
}
