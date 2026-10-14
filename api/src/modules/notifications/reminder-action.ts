import { generateMonthlyOccurrence } from '../tasks/monthly-recurrence';
import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Res,
  Body,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { createHmac, timingSafeEqual } from 'crypto';
import type { Response } from 'express';
import { Task } from '@entities/task.entity';
import { Reminder } from '@entities/reminder.entity';
import { ReminderStatus, TaskStatus } from '@entities/enums';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

export function signReminderAction(
  id: string,
  expires: number,
  secret: string,
) {
  const payload = `${id}.${expires}`;
  return `${payload}.${createHmac('sha256', secret).update(`reminder-done:${payload}`).digest('base64url')}`;
}
export function verifyReminderAction(
  token: unknown,
  secret: string,
  now = Date.now(),
): string {
  if (typeof token !== 'string' || token.length > 256)
    throw new BadRequestException('Invalid reminder link');
  const [id, expiration, signature, extra] = token.split('.');
  if (
    extra ||
    !/^[0-9a-f-]{36}$/i.test(id ?? '') ||
    !signature ||
    !/^\d+$/.test(expiration ?? '') ||
    Number(expiration) <= now
  )
    throw new BadRequestException('Invalid or expired reminder link');
  const expected = signReminderAction(id, Number(expiration), secret).split(
    '.',
  )[2];
  const a = Buffer.from(signature),
    b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b))
    throw new BadRequestException('Invalid reminder link');
  return id;
}

@ApiTags('reminder-actions')
@Controller('reminder-actions')
export class ReminderActionController {
  constructor(
    private readonly config: ConfigService,
    private readonly source: DataSource,
  ) {}
  @Get('done')
  @ApiOperation({
    summary: 'Confirmer une tâche depuis un lien signé (aucune mutation GET)',
  })
  async confirm(@Query('token') token: string, @Res() response: Response) {
    const id = verifyReminderAction(
      token,
      this.config.get<string>('jwt.secret'),
    );
    if (!(await this.source.getRepository(Reminder).existsBy({ id })))
      throw new BadRequestException('Reminder no longer exists');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.redirect(
      `${this.config.get<string>('notifications.appUrl')}/reminders/done?token=${encodeURIComponent(token)}`,
    );
  }
  @Get('preview')
  @ApiOperation({
    summary: 'Lire la tâche depuis le lien signé sans la modifier',
  })
  async preview(
    @Query('token') token: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const id = verifyReminderAction(
      token,
      this.config.get<string>('jwt.secret'),
    );
    const reminder = await this.source.getRepository(Reminder).findOne({
      where: { id },
      relations: { task: { user: true, blockers: true } },
    });
    if (!reminder?.task) throw new BadRequestException('Task no longer exists');
    if (reminder.task.user.suspendedAt)
      throw new BadRequestException('Compte suspendu');
    response.setHeader('Cache-Control', 'no-store');
    return {
      title: reminder.task.title,
      deadline: reminder.task.deadline,
      timezone: reminder.task.user.timezone,
      completed: reminder.task.status === TaskStatus.DONE,
      archived: reminder.task.status === TaskStatus.ARCHIVED,
      blocked: reminder.task.blockers.some(
        (task) => ![TaskStatus.DONE, TaskStatus.ARCHIVED].includes(task.status),
      ),
    };
  }
  @Post('done')
  @ApiOperation({
    summary: 'Terminer la tâche après confirmation du lien signé',
  })
  async complete(@Body('token') token: unknown) {
    const id = verifyReminderAction(
      token,
      this.config.get<string>('jwt.secret'),
    );
    return this.source.transaction(async (manager) => {
      const reminder = await manager.findOneBy(Reminder, { id });
      if (!reminder) throw new BadRequestException('Reminder no longer exists');
      const task = await manager.findOne(Task, {
        where: { id: reminder.taskId },
        relations: { blockers: true, user: true },
      });
      if (!task) throw new BadRequestException('Task no longer exists');
      if (task.user?.suspendedAt)
        throw new BadRequestException('Compte suspendu');
      if (task.status === TaskStatus.ARCHIVED)
        throw new BadRequestException('Task is archived');
      if (
        task.blockers.some(
          (blocker) =>
            ![TaskStatus.DONE, TaskStatus.ARCHIVED].includes(blocker.status),
        )
      )
        throw new BadRequestException(
          'Cannot complete while blocker tasks are unfinished',
        );
      task.status = TaskStatus.DONE;
      await manager.save(task);
      await generateMonthlyOccurrence(manager, task.id);
      await manager.update(
        Reminder,
        { taskId: task.id, status: ReminderStatus.PENDING },
        { status: ReminderStatus.CANCELLED },
      );
      return { completed: true };
    });
  }
}
