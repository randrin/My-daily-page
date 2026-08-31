import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ReminderEntity } from '@models/reminder.entity';
import { TaskEntity } from '@models/task.entity';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { fromClientStatus } from './task.mapper';

const taskInclude = {
  category: true,
  reminders: { orderBy: { triggerAt: 'asc' as const } },
} satisfies Prisma.TaskInclude;

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId?: string): Promise<TaskEntity[]> {
    const tasks = await this.prisma.task.findMany({
      where: userId ? { userId } : undefined,
      include: taskInclude,
      orderBy: { createdAt: 'desc' },
    });
    return tasks.map(TaskEntity.fromPrisma);
  }

  async findOne(id: string, userId?: string): Promise<TaskEntity> {
    const task = await this.prisma.task.findFirst({
      where: { id, ...(userId ? { userId } : {}) },
      include: taskInclude,
    });

    if (!task) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }

    return TaskEntity.fromPrisma(task);
  }

  async create(dto: CreateTaskDto): Promise<TaskEntity> {
    await this.assertUserExists(dto.userId);

    if (dto.categoryId) {
      await this.assertCategoryBelongsToUser(dto.categoryId, dto.userId);
    }

    const { reminders } = dto;

    const task = await this.prisma.task.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        description: dto.description,
        status: dto.status
          ? (fromClientStatus(String(dto.status)) ?? dto.status)
          : undefined,
        priority: dto.priority,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        categoryId: dto.categoryId,
        recurrence: dto.recurrence,
        reminders: reminders?.length
          ? { create: reminders.map((r) => this.mapReminderCreate(r)) }
          : undefined,
      },
      include: taskInclude,
    });

    return TaskEntity.fromPrisma(task);
  }

  async update(id: string, dto: UpdateTaskDto): Promise<TaskEntity> {
    const existing = await this.findOne(id);

    if (dto.userId && dto.userId !== existing.userId) {
      await this.assertUserExists(dto.userId);
    }

    const userId = dto.userId ?? existing.userId;

    if (dto.categoryId) {
      await this.assertCategoryBelongsToUser(dto.categoryId, userId);
    }

    const { reminders, ...taskFields } = dto;

    if (reminders !== undefined) {
      await this.syncReminders(id, reminders);
    }

    if (Object.keys(this.mapTaskData(taskFields)).length > 0) {
      await this.prisma.task.update({
        where: { id },
        data: this.mapTaskData(taskFields),
      });
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<TaskEntity> {
    await this.findOne(id);
    const task = await this.prisma.task.delete({
      where: { id },
      include: taskInclude,
    });
    return TaskEntity.fromPrisma(task);
  }

  async addReminder(
    taskId: string,
    dto: CreateReminderDto,
  ): Promise<ReminderEntity> {
    await this.findOne(taskId);

    const reminder = await this.prisma.reminder.create({
      data: {
        taskId,
        ...this.mapReminderCreate(dto),
      },
    });

    return ReminderEntity.fromPrisma(reminder);
  }

  async updateReminder(
    taskId: string,
    reminderId: string,
    dto: UpdateReminderDto,
  ): Promise<ReminderEntity> {
    await this.assertReminderBelongsToTask(taskId, reminderId);

    const reminder = await this.prisma.reminder.update({
      where: { id: reminderId },
      data: this.mapReminderUpdate(dto),
    });

    return ReminderEntity.fromPrisma(reminder);
  }

  async removeReminder(
    taskId: string,
    reminderId: string,
  ): Promise<ReminderEntity> {
    await this.assertReminderBelongsToTask(taskId, reminderId);

    const reminder = await this.prisma.reminder.delete({
      where: { id: reminderId },
    });

    return ReminderEntity.fromPrisma(reminder);
  }

  private async syncReminders(
    taskId: string,
    reminders: UpdateReminderDto[],
  ): Promise<void> {
    const existing = await this.prisma.reminder.findMany({ where: { taskId } });
    const incomingIds = reminders.filter((r) => r.id).map((r) => r.id!);
    const toDelete = existing
      .filter((r) => !incomingIds.includes(r.id))
      .map((r) => r.id);

    if (toDelete.length) {
      await this.prisma.reminder.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    for (const reminder of reminders) {
      if (reminder.id) {
        const found = existing.find((r) => r.id === reminder.id);
        if (!found) {
          throw new BadRequestException(
            `Reminder "${reminder.id}" does not belong to task "${taskId}"`,
          );
        }
        await this.prisma.reminder.update({
          where: { id: reminder.id },
          data: this.mapReminderUpdate(reminder),
        });
      } else {
        if (!reminder.triggerAt || !reminder.channel) {
          throw new BadRequestException(
            'New reminders require triggerAt and channel',
          );
        }
        await this.prisma.reminder.create({
          data: {
            taskId,
            triggerAt: new Date(reminder.triggerAt),
            channel: reminder.channel,
          },
        });
      }
    }
  }

  private mapTaskData(
    dto: Partial<CreateTaskDto | UpdateTaskDto>,
  ): Prisma.TaskUpdateInput {
    const data: Prisma.TaskUpdateInput = {};

    if (dto.userId !== undefined) {
      data.user = { connect: { id: dto.userId } };
    }
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.status !== undefined) {
      data.status =
        typeof dto.status === 'string'
          ? (fromClientStatus(dto.status) ?? dto.status)
          : dto.status;
    }
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.deadline !== undefined) {
      data.deadline = dto.deadline ? new Date(dto.deadline) : null;
    }
    if (dto.categoryId !== undefined) {
      data.category = dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : { disconnect: true };
    }
    if (dto.recurrence !== undefined) data.recurrence = dto.recurrence;

    return data;
  }

  private mapReminderCreate(
    dto: CreateReminderDto,
  ): Prisma.ReminderCreateWithoutTaskInput {
    return {
      triggerAt: new Date(dto.triggerAt),
      channel: dto.channel,
    };
  }

  private mapReminderUpdate(
    dto: UpdateReminderDto,
  ): Prisma.ReminderUpdateInput {
    const data: Prisma.ReminderUpdateInput = {};

    if (dto.triggerAt !== undefined) {
      data.triggerAt = new Date(dto.triggerAt);
    }
    if (dto.channel !== undefined) data.channel = dto.channel;

    return data;
  }

  private async assertUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }
  }

  private async assertCategoryBelongsToUser(
    categoryId: string,
    userId: string,
  ): Promise<void> {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, userId },
    });
    if (!category) {
      throw new NotFoundException(
        `Category with id "${categoryId}" not found for this user`,
      );
    }
  }

  private async assertReminderBelongsToTask(
    taskId: string,
    reminderId: string,
  ): Promise<ReminderEntity> {
    const reminder = await this.prisma.reminder.findFirst({
      where: { id: reminderId, taskId },
    });
    if (!reminder) {
      throw new NotFoundException(
        `Reminder with id "${reminderId}" not found for task "${taskId}"`,
      );
    }
    return ReminderEntity.fromPrisma(reminder);
  }
}
