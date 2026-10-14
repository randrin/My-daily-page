import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  TaskDefaultsDto,
  InviteCompanionDto,
  AcceptCompanionDto,
} from './dto/personalization.dto';
import { taskDefaults } from './defaults';
import { planReminders } from '../notifications/reminder-plan';
import { NotifChannel, Priority, TaskStatus } from '@entities/enums';
describe('Personalization rules', () => {
  it('validates defaults and requires consent', async () => {
    expect(
      await validate(plainToInstance(TaskDefaultsDto, taskDefaults)),
    ).toHaveLength(0);
    expect(
      (
        await validate(
          plainToInstance(TaskDefaultsDto, {
            ...taskDefaults,
            reminderLeadMinutes: -1,
          }),
        )
      ).length,
    ).toBeGreaterThan(0);
    expect(
      (
        await validate(
          plainToInstance(InviteCompanionDto, {
            email: 'person@example.invalid',
            consent: false,
          }),
        )
      ).length,
    ).toBeGreaterThan(0);
    expect(
      (await validate(plainToInstance(AcceptCompanionDto, { consent: false })))
        .length,
    ).toBeGreaterThan(0);
  });
  it('schedules a nonurgent task before its deadline without changing urgent escalation', () => {
    const now = new Date('2026-10-13T00:00:00Z'),
      deadline = new Date('2026-10-20T10:00:00Z');
    const task = {
      deadline,
      priority: Priority.MEDIUM,
      status: TaskStatus.TODO,
      reminderLeadMinutes: 60,
    };
    const plans = planReminders(task, [NotifChannel.EMAIL], now);
    expect(plans[0].triggerAt.toISOString()).toBe('2026-10-20T09:00:00.000Z');
    expect(
      planReminders(
        { ...task, priority: Priority.URGENT },
        [NotifChannel.EMAIL],
        now,
      ),
    ).toHaveLength(4);
    expect(
      planReminders(
        task,
        [NotifChannel.EMAIL],
        new Date('2026-10-20T09:30:00Z'),
      ),
    ).toHaveLength(0);
  });
});
