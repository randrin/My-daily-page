import { Priority } from '@entities/enums';
import {
  localDay,
  morningTime,
  nextDeliveryTime,
  DailyTiming,
} from './daily-timing';

const settings: DailyTiming = {
  timezone: 'Europe/Paris',
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  quietHoursAllowUrgent: false,
};

describe('Daily timing', () => {
  it.each([
    ['2026-10-07T21:00:00Z', '2026-10-08T05:00:00.000Z'],
    ['2026-03-28T22:00:00Z', '2026-03-29T05:00:00.000Z'],
    ['2026-10-24T21:00:00Z', '2026-10-25T06:00:00.000Z'],
  ])('defers through midnight and DST from %s', (instant, expected) => {
    expect(nextDeliveryTime(new Date(instant), settings).toISOString()).toBe(
      expected,
    );
  });
  it('includes the start and excludes the end of quiet hours', () => {
    expect(
      nextDeliveryTime(new Date('2026-10-07T20:00Z'), settings).toISOString(),
    ).toBe('2026-10-08T05:00:00.000Z');
    const end = new Date('2026-10-08T05:00Z');
    expect(nextDeliveryTime(end, settings)).toBe(end);
  });
  it('only bypasses quiet hours for explicitly authorized urgent tasks', () => {
    const now = new Date('2026-10-07T21:00Z');
    expect(nextDeliveryTime(now, settings, Priority.URGENT)).not.toEqual(now);
    expect(
      nextDeliveryTime(
        now,
        { ...settings, quietHoursAllowUrgent: true },
        Priority.URGENT,
      ),
    ).toBe(now);
    expect(
      nextDeliveryTime(
        now,
        { ...settings, quietHoursAllowUrgent: true },
        Priority.HIGH,
      ),
    ).not.toEqual(now);
    expect(
      nextDeliveryTime(now, { ...settings, quietHoursEnabled: false }),
    ).toBe(now);
  });
  it('supports a daytime quiet window', () => {
    expect(
      nextDeliveryTime(new Date('2026-10-07T10:30Z'), {
        ...settings,
        quietHoursStart: '12:00',
        quietHoursEnd: '14:00',
      }).toISOString(),
    ).toBe('2026-10-07T12:00:00.000Z');
  });
  it.each([
    ['2026-10-07', 'Europe/Paris', '2026-10-07T05:30:00.000Z'],
    ['2026-10-25', 'Europe/Paris', '2026-10-25T06:30:00.000Z'],
    ['2026-03-29', 'Europe/Paris', '2026-03-29T05:30:00.000Z'],
    ['2026-10-07', 'Asia/Kathmandu', '2026-10-07T01:45:00.000Z'],
    ['2026-10-07', 'America/New_York', '2026-10-07T11:30:00.000Z'],
  ])('resolves the morning time for %s %s', (day, timezone, expected) => {
    expect(morningTime(day, timezone).toISOString()).toBe(expected);
    expect(localDay(morningTime(day, timezone), timezone)).toBe(day);
  });
});

it('pauses every channel including explicitly authorized urgency, then applies quiet hours', () => {
  const now = new Date('2026-10-08T08:00Z');
  const paused = {
    ...settings,
    notificationsPausedUntil: new Date('2026-10-09T21:00Z'),
    quietHoursAllowUrgent: true,
  };
  expect(nextDeliveryTime(now, paused, Priority.URGENT).toISOString()).toBe(
    '2026-10-09T21:00:00.000Z',
  );
  expect(nextDeliveryTime(now, paused, Priority.HIGH).toISOString()).toBe(
    '2026-10-10T05:00:00.000Z',
  );
});

it('automatically resumes after the pause expires', () => {
  const now = new Date('2026-10-08T08:00Z');
  expect(
    nextDeliveryTime(now, {
      ...settings,
      notificationsPausedUntil: new Date('2026-10-08T07:00Z'),
    }),
  ).toBe(now);
});
