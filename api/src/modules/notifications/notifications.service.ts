import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { NotifChannel, ReminderStatus, TaskStatus } from '@entities/enums';
import { Reminder } from '@entities/reminder.entity';
import { Task } from '@entities/task.entity';
import { NOTIFICATION_QUEUE } from '../queue/queue.constants';
import { SendNotificationDto } from './dto/send-notification.dto';
import { NotificationJobPayload } from './interfaces/notification-job.interface';

import { ReminderHistoryDto } from './dto/reminder-history.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Reminder)
    private readonly reminders: Repository<Reminder>,
    @InjectRepository(Task)
    private readonly tasks: Repository<Task>,
    @InjectQueue(NOTIFICATION_QUEUE)
    private readonly notificationQueue: Queue<NotificationJobPayload>,
  ) {}

  findAll(userId: string, taskId?: string): Promise<Reminder[]> {
    return this.reminders.find({
      where: taskId ? { taskId, task: { userId } } : { task: { userId } },
      relations: { task: true },
      order: { triggerAt: 'DESC' },
    });
  }

  async history(userId: string, filters: ReminderHistoryDto) {
    const query = this.reminders
      .createQueryBuilder('reminder')
      .innerJoinAndSelect('reminder.task', 'task')
      .where('task.userId = :userId', { userId });
    if (filters.channel)
      query.andWhere('reminder.channel = :channel', {
        channel: filters.channel,
      });
    if (filters.status)
      query.andWhere('reminder.status = :status', { status: filters.status });
    const columns: Record<string, string> = {
      title: 'task.title',
      channel: 'reminder.channel',
      triggerAt: 'reminder.triggerAt',
      status: 'reminder.status',
      attempts: 'reminder.attempts',
      lastError: 'reminder.lastError',
    };
    const total = await query.getCount();
    const pageCount = Math.max(1, Math.ceil(total / filters.pageSize));
    const page = Math.min(filters.page, pageCount);
    const items = await query
      .orderBy(
        columns[filters.sortBy],
        filters.direction === 'asc' ? 'ASC' : 'DESC',
        'NULLS LAST',
      )
      .addOrderBy('reminder.id', 'ASC')
      .skip((page - 1) * filters.pageSize)
      .take(filters.pageSize)
      .getMany();
    return { items, total, page, pageSize: filters.pageSize, pageCount };
  }

  async findOne(id: string, userId: string): Promise<Reminder> {
    const reminder = await this.reminders.findOne({
      where: { id, task: { userId } },
      relations: { task: true },
    });
    if (!reminder) {
      throw new NotFoundException(`Reminder with id "${id}" not found`);
    }
    return reminder;
  }

  async send(userId: string, dto: SendNotificationDto): Promise<Reminder> {
    const task = await this.tasks.findOne({
      where: { id: dto.taskId, userId },
      relations: { user: { notifChannels: true } },
    });
    if (!task) {
      throw new NotFoundException(`Task with id "${dto.taskId}" not found`);
    }

    if (!task.user.notificationsEnabled)
      throw new BadRequestException('User notifications are disabled');
    const preference = task.user.notifChannels.find(
      (p) => p.channel === dto.channel && p.enabled,
    );
    if (!preference)
      throw new BadRequestException('Notification channel is disabled');
    if ([TaskStatus.DONE, TaskStatus.ARCHIVED].includes(task.status))
      throw new BadRequestException('Completed tasks cannot send reminders');
    const recipient =
      dto.channel === NotifChannel.EMAIL
        ? task.user.email
        : dto.channel === NotifChannel.SMS
          ? task.user.phoneNumber
          : task.user.whatsappNumber;
    if (!recipient || dto.recipient !== recipient)
      throw new BadRequestException('Recipient must match your profile');
    if (dto.channel === NotifChannel.WHATSAPP && !preference.whatsappOptIn)
      throw new BadRequestException(
        'WhatsApp requires a number and explicit opt-in',
      );
    if (dto.triggerAt && new Date(dto.triggerAt).getTime() <= Date.now())
      throw new BadRequestException('Reminder must be in the future');

    const reminder = await this.reminders.save(
      this.reminders.create({
        taskId: dto.taskId,
        channel: dto.channel,
        triggerAt: dto.triggerAt ? new Date(dto.triggerAt) : new Date(),
        status: ReminderStatus.PENDING,
      }),
    );

    await this.notificationQueue.add(
      'send',
      {
        reminderId: reminder.id,
        channel: dto.channel,
        recipient: dto.recipient,
        subject: dto.subject,
        body: dto.body,
      },
      {
        jobId: reminder.id,
        delay: Math.max(0, reminder.triggerAt.getTime() - Date.now()),
        attempts: 3,
        backoff: { type: 'exponential', delay: 30000 },
      },
    );

    return reminder;
  }
}
