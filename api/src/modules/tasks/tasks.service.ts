import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Category } from '@entities/category.entity';
import { ReminderStatus } from '@entities/enums';
import { Reminder } from '@entities/reminder.entity';
import { Task } from '@entities/task.entity';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

const taskRelations = { category: true, reminders: true } as const;

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasks: Repository<Task>,
    @InjectRepository(Reminder)
    private readonly reminders: Repository<Reminder>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  findAll(userId: string): Promise<Task[]> {
    return this.tasks.find({
      where: { userId },
      relations: taskRelations,
      order: { createdAt: 'DESC', reminders: { triggerAt: 'ASC' } },
    });
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.tasks.findOne({
      where: { id, userId },
      relations: taskRelations,
    });

    if (!task) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }

    return task;
  }

  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    if (dto.categoryId) {
      await this.assertCategoryBelongsToUser(dto.categoryId, userId);
    }

    const task = this.tasks.create({
      userId,
      title: dto.title,
      description: dto.description ?? null,
      status: dto.status,
      priority: dto.priority,
      deadline: dto.deadline ? new Date(dto.deadline) : null,
      categoryId: dto.categoryId ?? null,
      recurrence: dto.recurrence ?? null,
      reminders: dto.reminders?.map((reminder) =>
        this.reminders.create({
          triggerAt: new Date(reminder.triggerAt),
          channel: reminder.channel,
          status: ReminderStatus.PENDING,
        }),
      ),
    });

    const saved = await this.tasks.save(task);
    return this.findOne(saved.id, userId);
  }

  async update(id: string, userId: string, dto: UpdateTaskDto): Promise<Task> {
    const existing = await this.findOne(id, userId);

    if (dto.categoryId) {
      await this.assertCategoryBelongsToUser(dto.categoryId, userId);
    }

    const { reminders, ...taskFields } = dto;

    if (reminders !== undefined) {
      await this.syncReminders(id, reminders);
    }

    Object.assign(existing, {
      ...taskFields,
      description:
        taskFields.description === undefined
          ? existing.description
          : (taskFields.description ?? null),
      deadline:
        taskFields.deadline === undefined
          ? existing.deadline
          : taskFields.deadline
            ? new Date(taskFields.deadline)
            : null,
      categoryId:
        taskFields.categoryId === undefined
          ? existing.categoryId
          : (taskFields.categoryId ?? null),
      recurrence:
        taskFields.recurrence === undefined
          ? existing.recurrence
          : (taskFields.recurrence ?? null),
    });

    await this.tasks.save(existing);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);
    await this.tasks.delete({ id: task.id, userId });
    return task;
  }

  async addReminder(
    taskId: string,
    userId: string,
    dto: CreateReminderDto,
  ): Promise<Reminder> {
    await this.findOne(taskId, userId);

    const reminder = this.reminders.create({
      taskId,
      triggerAt: new Date(dto.triggerAt),
      channel: dto.channel,
      status: ReminderStatus.PENDING,
    });

    return this.reminders.save(reminder);
  }

  async updateReminder(
    taskId: string,
    reminderId: string,
    userId: string,
    dto: UpdateReminderDto,
  ): Promise<Reminder> {
    const reminder = await this.assertReminderBelongsToTask(
      taskId,
      reminderId,
      userId,
    );

    if (dto.triggerAt !== undefined) {
      reminder.triggerAt = new Date(dto.triggerAt);
    }
    if (dto.channel !== undefined) {
      reminder.channel = dto.channel;
    }

    return this.reminders.save(reminder);
  }

  async removeReminder(
    taskId: string,
    reminderId: string,
    userId: string,
  ): Promise<Reminder> {
    const reminder = await this.assertReminderBelongsToTask(
      taskId,
      reminderId,
      userId,
    );
    await this.reminders.delete({ id: reminder.id });
    return reminder;
  }

  private async syncReminders(
    taskId: string,
    reminders: UpdateReminderDto[],
  ): Promise<void> {
    const existing = await this.reminders.find({ where: { taskId } });
    const incomingIds = reminders.filter((r) => r.id).map((r) => r.id!);
    const toDelete = existing
      .filter((r) => !incomingIds.includes(r.id))
      .map((r) => r.id);

    if (toDelete.length) {
      await this.reminders.delete({ id: In(toDelete) });
    }

    for (const reminder of reminders) {
      if (reminder.id) {
        const found = existing.find((r) => r.id === reminder.id);
        if (!found) {
          throw new BadRequestException(
            `Reminder "${reminder.id}" does not belong to task "${taskId}"`,
          );
        }
        if (reminder.triggerAt !== undefined) {
          found.triggerAt = new Date(reminder.triggerAt);
        }
        if (reminder.channel !== undefined) {
          found.channel = reminder.channel;
        }
        await this.reminders.save(found);
      } else {
        if (!reminder.triggerAt || !reminder.channel) {
          throw new BadRequestException(
            'New reminders require triggerAt and channel',
          );
        }
        await this.reminders.save(
          this.reminders.create({
            taskId,
            triggerAt: new Date(reminder.triggerAt),
            channel: reminder.channel,
            status: ReminderStatus.PENDING,
          }),
        );
      }
    }
  }

  private async assertCategoryBelongsToUser(
    categoryId: string,
    userId: string,
  ): Promise<void> {
    const category = await this.categories.findOne({
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
    userId: string,
  ): Promise<Reminder> {
    await this.findOne(taskId, userId);
    const reminder = await this.reminders.findOne({
      where: { id: reminderId, taskId },
    });
    if (!reminder) {
      throw new NotFoundException(
        `Reminder with id "${reminderId}" not found for task "${taskId}"`,
      );
    }
    return reminder;
  }
}
