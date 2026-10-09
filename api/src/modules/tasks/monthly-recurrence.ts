import { EntityManager } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { Task } from '@entities/task.entity';
import { User } from '@entities/user.entity';
import { TaskStatus } from '@entities/enums';

export function nextMonthlyDeadline(
  deadline: Date,
  timezone: string,
  anchorDay?: number | null,
  now = new Date(),
) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const parts = (date: Date) =>
    Object.fromEntries(
      formatter.formatToParts(date).map((p) => [p.type, p.value]),
    );
  const origin = parts(deadline);
  const day = anchorDay ?? Number(origin.day);
  const current = parts(now);
  const elapsedMonths =
    (Number(current.year) - Number(origin.year)) * 12 +
    Number(current.month) -
    Number(origin.month);
  const firstOffset = Math.max(1, elapsedMonths);
  for (let offset = firstOffset; offset <= firstOffset + 2; offset++) {
    const month = new Date(
      Date.UTC(Number(origin.year), Number(origin.month) - 1 + offset, 1),
    );
    const last = new Date(
      Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0),
    ).getUTCDate();
    const target = Date.UTC(
      month.getUTCFullYear(),
      month.getUTCMonth(),
      Math.min(day, last),
      Number(origin.hour),
      Number(origin.minute),
    );
    let best: Date | undefined;
    let bestDifference = Infinity;
    // Scan real instants: pick the first repeated time or move forward through a DST gap.
    for (let minute = -16 * 60; minute <= 16 * 60; minute++) {
      const instant = new Date(target + minute * 60000);
      const local = parts(instant);
      const stamp = Date.UTC(
        Number(local.year),
        Number(local.month) - 1,
        Number(local.day),
        Number(local.hour),
        Number(local.minute),
      );
      const difference = stamp - target;
      if (difference >= 0 && difference < bestDifference) {
        best = instant;
        bestDifference = difference;
      }
      if (difference === 0) break;
    }
    if (best && best > now) return { deadline: best, anchorDay: day };
  }
  throw new BadRequestException(
    'Impossible de calculer la prochaine échéance mensuelle',
  );
}

export async function generateMonthlyOccurrence(
  manager: EntityManager,
  taskId: string,
) {
  const source = await manager.findOne(Task, {
    where: { id: taskId },
    lock: { mode: 'pessimistic_write' },
  });
  if (
    !source ||
    source.status !== TaskStatus.DONE ||
    source.recurrence !== 'monthly' ||
    !source.deadline
  )
    return;
  if (await manager.existsBy(Task, { previousOccurrenceId: source.id })) return;
  const user = await manager.findOneByOrFail(User, { id: source.userId });
  const next = nextMonthlyDeadline(
    source.deadline,
    user.timezone,
    source.recurrenceDay,
  );
  await manager.save(
    Task,
    manager.create(Task, {
      userId: source.userId,
      title: source.title,
      description: source.description,
      amount: source.amount,
      currency: source.currency,
      reference: source.reference,
      priority: source.priority,
      categoryId: source.categoryId,
      status: TaskStatus.TODO,
      recurrence: 'monthly',
      recurrenceDay: next.anchorDay,
      deadline: next.deadline,
      previousOccurrenceId: source.id,
      // Notes, blockers and uploaded images belong to the completed occurrence.
    }),
  );
}
