import { Category } from './category.entity';
import { NotificationPreference } from './notification-preference.entity';
import { Reminder } from './reminder.entity';
import { Task } from './task.entity';
import { User } from './user.entity';

export const entities = [
  User,
  Category,
  Task,
  Reminder,
  NotificationPreference,
];

export { User, Category, Task, Reminder, NotificationPreference };
