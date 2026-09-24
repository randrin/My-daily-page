import { Priority, TaskStatus } from '@entities/enums';
import { Reminder } from '@entities/reminder.entity';
import { Task } from '@entities/task.entity';

const STATUS_TO_CLIENT: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'todo',
  [TaskStatus.IN_PROGRESS]: 'in-process',
  [TaskStatus.DONE]: 'done',
  [TaskStatus.ARCHIVED]: 'archived',
};

const STATUS_FROM_CLIENT: Record<string, TaskStatus> = {
  todo: TaskStatus.TODO,
  'in-process': TaskStatus.IN_PROGRESS,
  'in-progress': TaskStatus.IN_PROGRESS,
  in_progress: TaskStatus.IN_PROGRESS,
  done: TaskStatus.DONE,
  archived: TaskStatus.ARCHIVED,
  TODO: TaskStatus.TODO,
  IN_PROGRESS: TaskStatus.IN_PROGRESS,
  DONE: TaskStatus.DONE,
  ARCHIVED: TaskStatus.ARCHIVED,
};

const PRIORITY_FROM_CLIENT: Record<string, Priority> = {
  low: Priority.LOW,
  medium: Priority.MEDIUM,
  high: Priority.HIGH,
  urgent: Priority.URGENT,
  LOW: Priority.LOW,
  MEDIUM: Priority.MEDIUM,
  HIGH: Priority.HIGH,
  URGENT: Priority.URGENT,
};

export function fromClientStatus(status?: string): TaskStatus | undefined {
  if (!status) return undefined;
  return STATUS_FROM_CLIENT[status];
}

export function fromClientPriority(priority?: string): Priority | undefined {
  if (!priority) return undefined;
  return PRIORITY_FROM_CLIENT[priority];
}

export function toTaskResponse(task: Task) {
  return {
    ...task,
    status: STATUS_TO_CLIENT[task.status] ?? task.status,
    priority: task.priority?.toLowerCase() ?? task.priority,
    reminders: task.reminders?.map(toReminderResponse),
  };
}

export function toTaskListResponse(tasks: Task[]) {
  return tasks.map(toTaskResponse);
}

export function toTaskPageResponse(page: {
  items: Task[];
  total: number;
  page: number;
  pageSize: number;
}) {
  return {
    items: page.items.map(toTaskResponse),
    total: page.total,
    page: page.page,
    pageSize: page.pageSize,
  };
}

export function toTaskRangeResponse(result: {
  items: Task[];
  total: number;
  from: string | null;
  to: string | null;
}) {
  return {
    items: result.items.map(toTaskResponse),
    total: result.total,
    from: result.from,
    to: result.to,
  };
}

export function toReminderResponse(reminder: Reminder) {
  return {
    ...reminder,
    channel: reminder.channel.toLowerCase(),
  };
}
