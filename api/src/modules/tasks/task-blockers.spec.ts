import { BadRequestException } from '@nestjs/common';
import { TaskStatus } from '@entities/enums';
import {
  assertBlockedHasBlockers,
  assertCanCompleteWithBlockers,
  isFinishedStatus,
  TASK_BLOCKED_REQUIRES_BLOCKERS,
  TASK_CANNOT_COMPLETE_WHILE_BLOCKED,
} from './task-blockers';

describe('task-blockers', () => {
  it('considère done et archived comme terminés', () => {
    expect(isFinishedStatus(TaskStatus.DONE)).toBe(true);
    expect(isFinishedStatus(TaskStatus.ARCHIVED)).toBe(true);
    expect(isFinishedStatus(TaskStatus.TODO)).toBe(false);
    expect(isFinishedStatus(TaskStatus.BLOCKED)).toBe(false);
  });

  it('refuse de clôturer avec une tâche à faire', () => {
    expect(() => assertCanCompleteWithBlockers(TaskStatus.DONE, [{ status: TaskStatus.TODO }])).toThrow(BadRequestException);
  });

  it('exige au moins un bloqueur pour le statut BLOCKED', () => {
    expect(() =>
      assertBlockedHasBlockers(TaskStatus.BLOCKED, []),
    ).toThrow(BadRequestException);
    expect(() =>
      assertBlockedHasBlockers(TaskStatus.BLOCKED, []),
    ).toThrow(TASK_BLOCKED_REQUIRES_BLOCKERS);

    expect(() =>
      assertBlockedHasBlockers(TaskStatus.BLOCKED, [{ id: 'child-1' }]),
    ).not.toThrow();
    expect(() => assertBlockedHasBlockers(TaskStatus.TODO, [])).not.toThrow();
  });

  it('refuse done/archived tant qu’un bloqueur n’est pas terminé', () => {
    expect(() =>
      assertCanCompleteWithBlockers(TaskStatus.DONE, [
        { status: TaskStatus.IN_PROGRESS },
      ]),
    ).toThrow(TASK_CANNOT_COMPLETE_WHILE_BLOCKED);

    expect(() =>
      assertCanCompleteWithBlockers(TaskStatus.ARCHIVED, [
        { status: TaskStatus.IN_PROGRESS },
      ]),
    ).toThrow(BadRequestException);

    expect(() =>
      assertCanCompleteWithBlockers(TaskStatus.DONE, [
        { status: TaskStatus.DONE },
        { status: TaskStatus.ARCHIVED },
        { status: TaskStatus.BLOCKED },
      ]),
    ).not.toThrow();

    expect(() =>
      assertCanCompleteWithBlockers(TaskStatus.IN_PROGRESS, [
        { status: TaskStatus.IN_PROGRESS },
      ]),
    ).not.toThrow();
  });
});
