import { describe, expect, it } from 'vitest';
import { reminderDeadline } from './reminder-deadline';

describe('Deadline timezone conversion', () => {
  it('converts the selected Paris time to UTC', () => {
    expect(reminderDeadline(new Date(2026, 9, 5), '09:00', 'Europe/Paris')?.toISOString()).toBe('2026-10-05T07:00:00.000Z');
  });
  it('uses winter DST offset', () => {
    expect(reminderDeadline(new Date(2026, 11, 5), '09:00', 'Europe/Paris')?.toISOString()).toBe('2026-12-05T08:00:00.000Z');
  });
  it('rejects nonexistent DST times and malformed inputs', () => {
    expect(reminderDeadline(new Date(2026, 2, 29), '02:30', 'Europe/Paris')).toBeUndefined();
    expect(reminderDeadline(new Date(2026, 9, 5), '', 'Europe/Paris')).toBeUndefined();
  });
});
