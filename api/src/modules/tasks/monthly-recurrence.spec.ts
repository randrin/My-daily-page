import { EntityManager } from 'typeorm';
import { TaskStatus } from '@entities/enums';
import {
  generateMonthlyOccurrence,
  nextMonthlyDeadline,
} from './monthly-recurrence';

const before = new Date('2026-01-01T00:00Z');
describe('Monthly recurrence', () => {
  it('clamps February and retains the original day for March', () => {
    const feb = nextMonthlyDeadline(
      new Date('2026-01-31T08:00Z'),
      'Europe/Paris',
      null,
      before,
    );
    expect(feb.deadline.toISOString()).toBe('2026-02-28T08:00:00.000Z');
    const march = nextMonthlyDeadline(
      feb.deadline,
      'Europe/Paris',
      feb.anchorDay,
      before,
    );
    expect(march.deadline.toISOString()).toBe('2026-03-31T07:00:00.000Z');
  });
  it('handles leap years and year transitions', () => {
    expect(
      nextMonthlyDeadline(
        new Date('2028-01-31T09:00Z'),
        'UTC',
        null,
        before,
      ).deadline.toISOString(),
    ).toBe('2028-02-29T09:00:00.000Z');
    expect(
      nextMonthlyDeadline(
        new Date('2026-12-20T09:00Z'),
        'UTC',
        null,
        before,
      ).deadline.toISOString(),
    ).toBe('2027-01-20T09:00:00.000Z');
  });
  it('uses the first valid time after a daylight-saving gap', () => {
    expect(
      nextMonthlyDeadline(
        new Date('2026-02-28T01:30Z'),
        'Europe/Paris',
        29,
        before,
      ).deadline.toISOString(),
    ).toBe('2026-03-29T01:00:00.000Z');
  });
  it('skips missed months rather than creating overdue tasks', () => {
    expect(
      nextMonthlyDeadline(
        new Date('2020-01-31T09:00Z'),
        'UTC',
        null,
        new Date('2026-10-08T12:00Z'),
      ).deadline.toISOString(),
    ).toBe('2026-10-31T09:00:00.000Z');
  });
  it('creates a clean occurrence and checks for an existing successor under a lock', async () => {
    const source = {
      id: 'parent',
      userId: 'owner',
      status: TaskStatus.DONE,
      recurrence: 'monthly',
      deadline: new Date('2030-01-31T09:00Z'),
      title: 'Loyer',
      description: 'Paiement',
      priority: 'HIGH',
      categoryId: null,
    };
    const manager = {
      findOne: jest.fn().mockResolvedValue(source),
      existsBy: jest.fn().mockResolvedValue(false),
      findOneByOrFail: jest.fn().mockResolvedValue({ timezone: 'UTC' }),
      create: jest.fn((_, data: unknown) => data),
      save: jest.fn(),
    };
    await generateMonthlyOccurrence(
      manager as unknown as EntityManager,
      'parent',
    );
    expect(manager.findOne).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
    );
    expect(manager.save).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        status: TaskStatus.TODO,
        recurrenceDay: 31,
        previousOccurrenceId: 'parent',
        userId: 'owner',
      }),
    );
    expect(manager.create.mock.calls[0][1]).not.toHaveProperty('imageUrl');
    manager.save.mockClear();
    manager.existsBy.mockResolvedValue(true);
    await generateMonthlyOccurrence(
      manager as unknown as EntityManager,
      'parent',
    );
    expect(manager.save).not.toHaveBeenCalled();
  });
});
