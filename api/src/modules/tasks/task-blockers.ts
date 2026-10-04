import { BadRequestException } from '@nestjs/common';
import { TaskStatus } from '@entities/enums';
import { Task } from '@entities/task.entity';

export const TASK_BLOCKED_REQUIRES_BLOCKERS =
  'A blocked task requires at least one blocker';
export const TASK_CANNOT_COMPLETE_WHILE_BLOCKED =
  'Cannot mark this task as done or archived while blocker tasks are unfinished';
export const TASK_CANNOT_BLOCK_ITSELF = 'A task cannot block itself';
export const TASK_BLOCKERS_CYCLE = 'Blockers cannot form a cycle';

export function isFinishedStatus(status: TaskStatus): boolean {
  return status === TaskStatus.DONE || status === TaskStatus.ARCHIVED;
}

export function assertBlockedHasBlockers(
  status: TaskStatus,
  blockers: Pick<Task, 'id'>[],
): void {
  if (status === TaskStatus.BLOCKED && blockers.length === 0) {
    throw new BadRequestException(TASK_BLOCKED_REQUIRES_BLOCKERS);
  }
}

export function assertCanCompleteWithBlockers(
  status: TaskStatus,
  blockers: Pick<Task, 'status'>[],
): void {
  if (!isFinishedStatus(status)) return;
  if (blockers.some((blocker) => blocker.status === TaskStatus.IN_PROGRESS || blocker.status === TaskStatus.TODO)) {
    throw new BadRequestException(TASK_CANNOT_COMPLETE_WHILE_BLOCKED);
  }
}
