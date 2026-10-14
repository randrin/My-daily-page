import { NotifChannel, Priority, TaskStatus } from '@entities/enums';

export function planReminders(
  task: {
    deadline: Date | null;
    priority: Priority;
    status: TaskStatus;
    reminderLeadMinutes?: number;
  },
  channels: NotifChannel[],
  now: Date,
) {
  if (
    !task.deadline ||
    [TaskStatus.DONE, TaskStatus.ARCHIVED].includes(task.status)
  )
    return [];
  const offsets =
    task.priority === Priority.URGENT
      ? [72 * 3600000, 24 * 3600000, 2 * 3600000, 0]
      : [(task.reminderLeadMinutes ?? 0) * 60000];
  // Only urgent tasks use all enabled channels simultaneously.
  const chosen =
    task.priority === Priority.URGENT ? channels : channels.slice(0, 1);
  return offsets.flatMap((offset) => {
    const triggerAt = new Date(task.deadline.getTime() - offset);
    return triggerAt > now
      ? chosen.map((channel) => ({ channel, triggerAt }))
      : [];
  });
}
