import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { ReminderStatus } from '@entities/enums';
import { Reminder } from '@entities/reminder.entity';
import { Task } from '@entities/task.entity';
import { NOTIFICATION_QUEUE } from '../queue/queue.constants';
import { SendNotificationDto } from './dto/send-notification.dto';
import { NotificationJobPayload } from './interfaces/notification-job.interface';

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
    });
    if (!task) {
      throw new NotFoundException(`Task with id "${dto.taskId}" not found`);
    }

    const reminder = await this.reminders.save(
      this.reminders.create({
        taskId: dto.taskId,
        channel: dto.channel,
        triggerAt: dto.triggerAt ? new Date(dto.triggerAt) : new Date(),
        status: ReminderStatus.PENDING,
      }),
    );

    await this.notificationQueue.add('send', {
      reminderId: reminder.id,
      channel: dto.channel,
      recipient: dto.recipient,
      subject: dto.subject,
      body: dto.body,
    });

    return reminder;
  }
}
