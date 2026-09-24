import { Priority, TaskStatus } from '@entities/enums';
import { Task } from '@entities/task.entity';
import {
  fromClientPriority,
  fromClientStatus,
  toTaskPageResponse,
  toTaskRangeResponse,
  toTaskResponse,
} from './task.mapper';

describe('task.mapper', () => {
  it('mappe les statuts client vers l’enum API', () => {
    expect(fromClientStatus('todo')).toBe(TaskStatus.TODO);
    expect(fromClientStatus('in-process')).toBe(TaskStatus.IN_PROGRESS);
    expect(fromClientStatus('archived')).toBe(TaskStatus.ARCHIVED);
    expect(fromClientStatus('complete')).toBeUndefined();
  });

  it('mappe les priorités client vers l’enum API', () => {
    expect(fromClientPriority('high')).toBe(Priority.HIGH);
    expect(fromClientPriority('URGENT')).toBe(Priority.URGENT);
  });

  it('sérialise une page avec statuts et priorités client', () => {
    const task = {
      id: 't1',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      reminders: [],
    } as unknown as Task;

    expect(toTaskResponse(task)).toMatchObject({
      status: 'in-process',
      priority: 'high',
    });

    expect(
      toTaskPageResponse({
        items: [task],
        total: 1,
        page: 1,
        pageSize: 10,
      }),
    ).toEqual({
      items: [expect.objectContaining({ status: 'in-process', priority: 'high' })],
      total: 1,
      page: 1,
      pageSize: 10,
    });
  });

  it('sérialise une période de tâches', () => {
    const task = {
      id: 't1',
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      reminders: [],
    } as unknown as Task;

    expect(
      toTaskRangeResponse({
        items: [task],
        total: 1,
        from: '2026-08-23T00:00:00.000Z',
        to: '2026-09-23T23:59:59.999Z',
      }),
    ).toEqual({
      items: [expect.objectContaining({ status: 'todo', priority: 'low' })],
      total: 1,
      from: '2026-08-23T00:00:00.000Z',
      to: '2026-09-23T23:59:59.999Z',
    });
  });
});
