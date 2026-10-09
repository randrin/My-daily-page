import { CreateTaskListDto } from './dto/create-task-list.dto';
import { generateMonthlyOccurrence } from './monthly-recurrence';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '@entities/user.entity';
import { Category } from '@entities/category.entity';
import { Priority, ReminderStatus, TaskStatus } from '@entities/enums';
import { Reminder } from '@entities/reminder.entity';
import { Task } from '@entities/task.entity';
import { FilesService } from '../files/files.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { TasksRangeQueryDto } from './dto/tasks-range-query.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {
  TASK_BLOCKERS_CYCLE,
  TASK_CANNOT_BLOCK_ITSELF,
  assertBlockedHasBlockers,
  assertCanCompleteWithBlockers,
} from './task-blockers';

export const TASK_RANGE_LIMIT = 500;

export type TaskPage = {
  items: Task[];
  total: number;
  page: number;
  pageSize: number;
};

export type TaskRange = {
  items: Task[];
  total: number;
  from: string | null;
  to: string | null;
};

function escapeIlike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

const taskRelations = {
  category: true,
  reminders: true,
  blockers: true,
} as const;

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasks: Repository<Task>,
    @InjectRepository(Reminder)
    private readonly reminders: Repository<Reminder>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
    private readonly files: FilesService,
  ) {}

  async findConflicts(userId: string, deadline: string, excludeId?: string) {
    const instant = new Date(deadline);
    const from = new Date(Math.floor(instant.getTime() / 60000) * 60000);
    const to = new Date(from.getTime() + 60000);
    const qb = this.tasks
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId })
      .andWhere('task.deadline >= :from AND task.deadline < :to', { from, to })
      .andWhere('task.status IN (:...statuses)', {
        statuses: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED],
      });
    if (excludeId) qb.andWhere('task.id != :excludeId', { excludeId });
    const total = await qb.getCount();
    const items = await qb
      .select(['task.id', 'task.title'])
      .orderBy('task.title', 'ASC')
      .addOrderBy('task.id', 'ASC')
      .take(5)
      .getMany();
    return {
      total,
      items: items.map((task) => ({ id: task.id, title: task.title })),
    };
  }

  async findToday(userId: string, now = new Date()) {
    const user = await this.tasks.manager.findOneBy(User, { id: userId });
    if (!user) throw new NotFoundException('User not found');
    const timezone = user.timezone;
    const date = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    // Compare calendar dates in the user's timezone, including DST transitions.
    const base = this.tasks
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId })
      .andWhere(
        'CAST(task.deadline AT TIME ZONE :timezone AS date) = CAST(:date AS date)',
        { timezone, date },
      )
      .andWhere('task.status != :archived', { archived: TaskStatus.ARCHIVED });
    const total = await base.clone().getCount();
    const completed = await base
      .clone()
      .andWhere('task.status = :done', { done: TaskStatus.DONE })
      .getCount();
    const focused = await base
      .clone()
      .andWhere('task.status != :done', { done: TaskStatus.DONE })
      .orderBy(
        "CASE task.priority WHEN 'URGENT' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END",
        'ASC',
      )
      .addOrderBy('task.deadline', 'ASC')
      .addOrderBy('task.id', 'ASC')
      .take(3)
      .getMany();
    const ids = focused.map((task) => task.id);
    const related = ids.length
      ? await this.tasks.find({
          where: { userId, id: In(ids) },
          relations: taskRelations,
        })
      : [];
    const items = ids
      .map((id) => related.find((task) => task.id === id))
      .filter((task): task is Task => Boolean(task));
    return { date, timezone, total, completed, items };
  }

  async findAll(
    userId: string,
    query: ListTasksQueryDto = {},
  ): Promise<TaskPage> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;

    const countQb = this.tasks.createQueryBuilder('task');
    this.applyListFilters(countQb, userId, query);
    const total = await countQb.getCount();

    const qb = this.tasks
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.category', 'category')
      .leftJoinAndSelect('task.reminders', 'reminders')
      .leftJoinAndSelect('task.blockers', 'blockers');
    this.applyListFilters(qb, userId, query);
    this.applyListSort(qb, query);
    qb.skip((page - 1) * pageSize).take(pageSize);

    const items = await qb.getMany();
    return { items, total, page, pageSize };
  }

  async findInRange(
    userId: string,
    query: TasksRangeQueryDto = {},
  ): Promise<TaskRange> {
    if (query.from && query.to && new Date(query.from) > new Date(query.to)) {
      throw new BadRequestException('from must be before or equal to to');
    }

    const countQb = this.tasks.createQueryBuilder('task');
    this.applyListFilters(countQb, userId, {
      deadlineFrom: query.from,
      deadlineTo: query.to,
    });
    const total = await countQb.getCount();

    const qb = this.tasks
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.category', 'category')
      .leftJoinAndSelect('task.reminders', 'reminders')
      .leftJoinAndSelect('task.blockers', 'blockers');
    this.applyListFilters(qb, userId, {
      deadlineFrom: query.from,
      deadlineTo: query.to,
    });
    qb.orderBy('task.deadline', 'ASC')
      .addOrderBy('reminders.triggerAt', 'ASC')
      .take(TASK_RANGE_LIMIT);

    const items = await qb.getMany();
    return {
      items,
      total,
      from: query.from ?? null,
      to: query.to ?? null,
    };
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

  async createList(userId: string, dto: CreateTaskListDto) {
    const now = new Date();
    if (dto.tasks.some((task) => !task.title.trim() || !Number.isFinite(Date.parse(task.deadline)) || new Date(task.deadline) <= now))
      throw new BadRequestException('Chaque tâche doit avoir un titre et une échéance future');
    return this.tasks.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Task);
      const tasks = dto.tasks.map((item) => repo.create({
        userId,
        title: item.title.trim(),
        deadline: new Date(item.deadline),
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
      }));
      await repo.save(tasks);
      return { created: tasks.length };
    });
  }

  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    if (dto.categoryId) {
      await this.assertCategoryBelongsToUser(dto.categoryId, userId);
    }

    if (dto.recurrence === 'monthly' && !dto.deadline)
      throw new BadRequestException(
        'Une échéance est nécessaire pour une tâche mensuelle',
      );
    const status = dto.status ?? TaskStatus.TODO;
    const blockers = await this.resolveBlockers(userId, dto.blockerIds);
    assertBlockedHasBlockers(status, blockers);
    assertCanCompleteWithBlockers(status, blockers);

    const imageUrl = await this.files.normalizeOwnedUrl(userId, dto.imageUrl);

    const task = this.tasks.create({
      userId,
      title: dto.title,
      amount: dto.amount ?? null,
      currency: dto.currency ?? 'EUR',
      reference: dto.reference?.trim() || null,
      description: dto.description ?? null,
      status,
      priority: dto.priority,
      deadline: dto.deadline ? new Date(dto.deadline) : null,
      categoryId: dto.categoryId ?? null,
      recurrence: dto.recurrence ?? null,
      imageUrl,
      blockers,
      reminders: dto.reminders?.map((reminder) =>
        this.reminders.create({
          triggerAt: new Date(reminder.triggerAt),
          channel: reminder.channel,
          status: ReminderStatus.PENDING,
        }),
      ),
    });

    const saved =
      task.status === TaskStatus.DONE && task.recurrence === 'monthly'
        ? await this.tasks.manager.transaction(async (manager) => {
            const completed = await manager.save(Task, task);
            await generateMonthlyOccurrence(manager, completed.id);
            return completed;
          })
        : await this.tasks.save(task);
    return this.findOne(saved.id, userId);
  }

  async update(id: string, userId: string, dto: UpdateTaskDto): Promise<Task> {
    const existing = await this.findOne(id, userId);

    if (dto.categoryId) {
      await this.assertCategoryBelongsToUser(dto.categoryId, userId);
    }

    const {
      reminders,
      blockerIds,
      imageUrl: nextImageUrl,
      ...taskFields
    } = dto;

    if (reminders !== undefined) {
      await this.syncReminders(id, reminders);
    }

    const nextStatus = taskFields.status ?? existing.status;
    const blockers =
      blockerIds !== undefined
        ? await this.resolveBlockers(userId, blockerIds, id)
        : (existing.blockers ?? []);
    assertBlockedHasBlockers(nextStatus, blockers);
    assertCanCompleteWithBlockers(nextStatus, blockers);

    const imageUrl =
      nextImageUrl === undefined
        ? existing.imageUrl
        : await this.files.normalizeOwnedUrl(userId, nextImageUrl);

    if (imageUrl !== existing.imageUrl) {
      await this.files.removeByUrl(userId, existing.imageUrl);
    }

    const previousDeadline = existing.deadline?.getTime();
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
      imageUrl,
      blockers,
    });

    if (existing.recurrence === 'monthly' && !existing.deadline)
      throw new BadRequestException(
        'Une échéance est nécessaire pour une tâche mensuelle',
      );
    if (
      taskFields.deadline !== undefined &&
      existing.deadline?.getTime() !== previousDeadline
    )
      existing.recurrenceDay = null;
    if (
      existing.status === TaskStatus.DONE &&
      existing.recurrence === 'monthly'
    ) {
      await this.tasks.manager.transaction(async (manager) => {
        await manager.findOne(Task, {
          where: { id, userId },
          lock: { mode: 'pessimistic_write' },
        });
        await manager.save(Task, existing);
        await generateMonthlyOccurrence(manager, id);
      });
    } else {
      await this.tasks.save(existing);
    }
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);
    await this.files.removeByUrl(userId, task.imageUrl);
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

  private applyListFilters(
    qb: SelectQueryBuilder<Task>,
    userId: string,
    query: ListTasksQueryDto,
  ): void {
    qb.where('task.userId = :userId', { userId });

    if (query.search) {
      qb.andWhere(
        "(task.title ILIKE :search OR COALESCE(task.description, '') ILIKE :search)",
        { search: `%${escapeIlike(query.search)}%` },
      );
    }

    if (query.status?.length) {
      qb.andWhere('task.status IN (:...statuses)', {
        statuses: query.status,
      });
    }

    if (query.priority?.length) {
      qb.andWhere('task.priority IN (:...priorities)', {
        priorities: query.priority,
      });
    }

    if (query.categoryId?.length) {
      qb.andWhere('task.categoryId IN (:...categoryIds)', {
        categoryIds: query.categoryId,
      });
    }

    if (query.deadlineFrom) {
      qb.andWhere('task.deadline >= :deadlineFrom', {
        deadlineFrom: query.deadlineFrom,
      });
    }

    if (query.deadlineTo) {
      qb.andWhere('task.deadline <= :deadlineTo', {
        deadlineTo: query.deadlineTo,
      });
    }

    if (query.createdFrom) {
      qb.andWhere('task.createdAt >= :createdFrom', {
        createdFrom: query.createdFrom,
      });
    }

    if (query.createdTo) {
      qb.andWhere('task.createdAt <= :createdTo', {
        createdTo: query.createdTo,
      });
    }
  }

  private applyListSort(
    qb: SelectQueryBuilder<Task>,
    query: ListTasksQueryDto,
  ): void {
    const direction = query.sortOrder === 'desc' ? 'DESC' : 'ASC';

    switch (query.sortBy) {
      case 'status':
        qb.addSelect(
          `CASE task.status WHEN 'TODO' THEN 1 WHEN 'IN_PROGRESS' THEN 2 WHEN 'BLOCKED' THEN 3 WHEN 'DONE' THEN 4 WHEN 'ARCHIVED' THEN 5 ELSE 6 END`,
          'sort_status',
        ).orderBy('sort_status', direction);
        break;
      case 'priority':
        qb.addSelect(
          `CASE task.priority WHEN 'LOW' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'HIGH' THEN 3 WHEN 'URGENT' THEN 4 ELSE 5 END`,
          'sort_priority',
        ).orderBy('sort_priority', direction);
        break;
      case 'title':
        qb.orderBy('task.title', direction);
        break;
      case 'description':
        qb.addSelect(
          `COALESCE(task.description, '')`,
          'sort_description',
        ).orderBy('sort_description', direction);
        break;
      case 'category':
        qb.orderBy('category.name', direction, 'NULLS LAST');
        break;
      case 'deadline':
        qb.orderBy('task.deadline', direction, 'NULLS LAST');
        break;
      default:
        qb.orderBy('task.createdAt', 'DESC');
    }

    qb.addOrderBy('task.id', 'ASC').addOrderBy('reminders.triggerAt', 'ASC');
  }

  private async resolveBlockers(
    userId: string,
    blockerIds: string[] | undefined,
    taskId?: string,
  ): Promise<Task[]> {
    const unique = [...new Set(blockerIds ?? [])];
    if (taskId && unique.includes(taskId)) {
      throw new BadRequestException(TASK_CANNOT_BLOCK_ITSELF);
    }
    if (!unique.length) return [];

    const found = await this.tasks.find({
      where: { id: In(unique), userId },
    });
    if (found.length !== unique.length) {
      throw new NotFoundException(
        'One or more blocker tasks were not found for this user',
      );
    }

    if (
      found.some(
        (blocker) =>
          blocker.status !== TaskStatus.IN_PROGRESS &&
          blocker.status !== TaskStatus.TODO,
      )
    ) {
      throw new BadRequestException(
        'Only todo or in-progress tasks can be selected as blockers',
      );
    }

    if (taskId) {
      await this.assertNoBlockerCycles(taskId, unique);
    }

    return found;
  }

  private async assertNoBlockerCycles(
    taskId: string,
    blockerIds: string[],
  ): Promise<void> {
    const visited = new Set<string>();
    const stack = [...blockerIds];

    while (stack.length) {
      const id = stack.pop()!;
      if (id === taskId) {
        throw new BadRequestException(TASK_BLOCKERS_CYCLE);
      }
      if (visited.has(id)) continue;
      visited.add(id);

      const node = await this.tasks.findOne({
        where: { id },
        relations: { blockers: true },
      });
      for (const blocker of node?.blockers ?? []) {
        stack.push(blocker.id);
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
