import type { TaskStatus, Priority } from '@prisma/client';
import type {
  PrismaCategory,
  PrismaReminder,
  PrismaTask,
} from './prisma.types';
import { CategoryEntity } from './category.entity';
import { ReminderEntity } from './reminder.entity';

export class TaskEntity implements PrismaTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  deadline: Date | null;
  categoryId: string | null;
  userId: string;
  recurrence: string | null;
  createdAt: Date;
  updatedAt: Date;

  category?: CategoryEntity | null;
  reminders?: ReminderEntity[];

  constructor(data: Partial<TaskEntity>) {
    Object.assign(this, data);
  }

  static fromPrisma(
    this: void,
    data: PrismaTask & {
      category?: PrismaCategory | null;
      reminders?: PrismaReminder[];
    },
  ): TaskEntity {
    return new TaskEntity({
      ...data,
      category: data.category
        ? CategoryEntity.fromPrisma(data.category)
        : data.category,
      reminders: data.reminders?.map(ReminderEntity.fromPrisma),
    });
  }
}

export type TaskWithRelations = TaskEntity;

export type { TaskStatus, Priority };
