import { NotifChannel, Priority, TaskStatus } from '@entities/enums';

export function adaptivePlan(
  task: { deadline: Date | null; priority: Priority; status: TaskStatus },
  channels: NotifChannel[],
  now: Date,
) {
  if (
    !task.deadline ||
    task.priority === Priority.URGENT ||
    [TaskStatus.DONE, TaskStatus.ARCHIVED].includes(task.status) ||
    !channels.includes(NotifChannel.EMAIL) ||
    !channels.includes(NotifChannel.WHATSAPP) ||
    task.deadline.getTime() < now.getTime() - 7 * 86400000
  )
    return [];
  return [NotifChannel.EMAIL, NotifChannel.EMAIL, NotifChannel.WHATSAPP].map(
    (channel, index) => ({
      channel,
      triggerAt: new Date(task.deadline.getTime() + index * 3600000),
    }),
  );
}
