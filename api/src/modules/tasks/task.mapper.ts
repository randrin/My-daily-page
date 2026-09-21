import { TaskStatus } from '@entities/enums';
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

export function fromClientStatus(status?: string): TaskStatus | undefined {
  if (!status) return undefined;
  return STATUS_FROM_CLIENT[status];
}

export function toTaskResponse(task: Task) {
  return {
    ...task,
    status: STATUS_TO_CLIENT[task.status] ?? task.status,
    reminders: task.reminders?.map(toReminderResponse),
  };
}

export function toTaskListResponse(tasks: Task[]) {
  return tasks.map(toTaskResponse);
}

export function toReminderResponse(reminder: Reminder) {
  return {
    ...reminder,
    channel: reminder.channel.toLowerCase(),
  };
}
