import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ReminderStatus } from '@prisma/client';
import { Queue } from 'bullmq';
import { ReminderEntity } from '@models/reminder.entity';
import { NOTIFICATION_QUEUE } from '../queue/queue.constants';
import { PrismaService } from '../prisma/prisma.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { NotificationJobPayload } from './interfaces/notification-job.interface';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(NOTIFICATION_QUEUE)
    private readonly notificationQueue: Queue<NotificationJobPayload>,
  ) {}

  async findAll(taskId?: string): Promise<ReminderEntity[]> {
    const reminders = await this.prisma.reminder.findMany({
      where: taskId ? { taskId } : undefined,
      orderBy: { triggerAt: 'desc' },
      include: { task: true },
    });
    return reminders.map(ReminderEntity.fromPrisma);
  }

  async findOne(id: string): Promise<ReminderEntity> {
    const reminder = await this.prisma.reminder.findUnique({
      where: { id },
      include: { task: true },
    });
    if (!reminder) {
      throw new NotFoundException(`Reminder with id "${id}" not found`);
    }
    return ReminderEntity.fromPrisma(reminder);
  }

  async send(dto: SendNotificationDto): Promise<ReminderEntity> {
    const task = await this.prisma.task.findUnique({
      where: { id: dto.taskId },
    });
    if (!task) {
      throw new NotFoundException(`Task with id "${dto.taskId}" not found`);
    }

    const triggerAt = dto.triggerAt ? new Date(dto.triggerAt) : new Date();

    const reminder = await this.prisma.reminder.create({
      data: {
        taskId: dto.taskId,
        channel: dto.channel,
        triggerAt,
        status: ReminderStatus.PENDING,
      },
    });

    await this.notificationQueue.add('send', {
      reminderId: reminder.id,
      channel: dto.channel,
      recipient: dto.recipient,
      subject: dto.subject,
      body: dto.body,
    });

    return ReminderEntity.fromPrisma(reminder);
  }
}
