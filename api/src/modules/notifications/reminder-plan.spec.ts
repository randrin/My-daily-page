import { NotifChannel, Priority, TaskStatus } from '@entities/enums';
import { planReminders } from './reminder-plan';
import { signReminderAction, verifyReminderAction } from './reminder-action';

describe('Reminder scheduling and signed actions', () => {
  const now = new Date('2026-10-05T08:00:00Z');
  const task = {
    deadline: new Date('2026-10-10T08:00:00Z'),
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
  };
  it('plans only the primary channel for normal tasks', () => {
    expect(
      planReminders(task, [NotifChannel.EMAIL, NotifChannel.SMS], now),
    ).toEqual([{ channel: NotifChannel.EMAIL, triggerAt: task.deadline }]);
  });
  it('plans four urgent escalations on the enabled channels', () => {
    const result = planReminders(
      { ...task, priority: Priority.URGENT },
      [NotifChannel.EMAIL, NotifChannel.WHATSAPP],
      now,
    );
    expect(result).toHaveLength(8);
    expect(result[0].triggerAt.toISOString()).toBe('2026-10-07T08:00:00.000Z');
  });
  it('does not recreate past escalations', () => {
    const result = planReminders(
      { ...task, priority: Priority.URGENT },
      [NotifChannel.EMAIL],
      new Date('2026-10-10T07:00:00Z'),
    );
    expect(result).toHaveLength(1);
  });
  it('ignores completed, archived and undated tasks', () => {
    for (const status of [TaskStatus.DONE, TaskStatus.ARCHIVED])
      expect(
        planReminders({ ...task, status }, [NotifChannel.EMAIL], now),
      ).toEqual([]);
    expect(
      planReminders({ ...task, deadline: null }, [NotifChannel.EMAIL], now),
    ).toEqual([]);
  });
  it('validates the signature and rejects tampering and expiration', () => {
    const id = '11111111-1111-4111-8111-111111111111';
    const token = signReminderAction(id, now.getTime() + 10000, 'secret');
    expect(verifyReminderAction(token, 'secret', now.getTime())).toBe(id);
    expect(() => verifyReminderAction(token, 'other', now.getTime())).toThrow();
    expect(() =>
      verifyReminderAction(token, 'secret', now.getTime() + 10001),
    ).toThrow();
    expect(() =>
      verifyReminderAction(
        token.replace(id, '22222222-2222-4222-8222-222222222222'),
        'secret',
        now.getTime(),
      ),
    ).toThrow();
  });
});
