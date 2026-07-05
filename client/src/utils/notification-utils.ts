import { Task } from "@/types/task";

export interface NotificationTask {
  task: Task;
  type: "due-this-week" | "due-this-month" | "overdue";
  daysUntilDue: number;
}

export function getNotifications(tasks: Task[]): NotificationTask[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const oneWeekFromNow = new Date(today);
  oneWeekFromNow.setDate(today.getDate() + 7);
  const oneMonthFromNow = new Date(today);
  oneMonthFromNow.setMonth(today.getMonth() + 1);

  const notifications: NotificationTask[] = [];

  tasks
    .filter((task) => task.status !== "complete" && task.dueDate)
    .forEach((task) => {
      if (!task.dueDate) return;

      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const daysUntilDue = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dueDate < today) {
        // Overdue
        notifications.push({
          task,
          type: "overdue",
          daysUntilDue: -daysUntilDue,
        });
      } else if (dueDate <= oneWeekFromNow) {
        // Due this week
        notifications.push({
          task,
          type: "due-this-week",
          daysUntilDue,
        });
      } else if (dueDate <= oneMonthFromNow) {
        // Due this month
        notifications.push({
          task,
          type: "due-this-month",
          daysUntilDue,
        });
      }
    });

  // Sort by type (overdue first, then due-this-week, then due-this-month) and by days until due
  return notifications.sort((a, b) => {
    const typeOrder = { overdue: 0, "due-this-week": 1, "due-this-month": 2 };
    if (typeOrder[a.type] !== typeOrder[b.type]) {
      return typeOrder[a.type] - typeOrder[b.type];
    }
    return a.daysUntilDue - b.daysUntilDue;
  });
}

export function formatNotificationDate(daysUntilDue: number, type: NotificationTask["type"]): string {
  if (type === "overdue") {
    if (daysUntilDue === 1) {
      return "Yesterday";
    }
    return `${daysUntilDue} days overdue`;
  }

  if (daysUntilDue === 0) {
    return "Today";
  }
  if (daysUntilDue === 1) {
    return "Tomorrow";
  }
  if (daysUntilDue <= 7) {
    return `In ${daysUntilDue} days`;
  }
  
  const weeks = Math.floor(daysUntilDue / 7);
  if (weeks === 1) {
    return "In 1 week";
  }
  return `In ${weeks} weeks`;
}
