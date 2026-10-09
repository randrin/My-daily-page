import { validate } from 'class-validator';
import { Repository } from 'typeorm';
import { User } from '@entities/user.entity';
import { UpdateDailySettingsDto } from './dto/update-daily-settings.dto';
import { NotificationPreferencesService } from './notification-preferences.service';

const settings = {
  dailyDigestEnabled: true,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  quietHoursAllowUrgent: false,
};
it('validates explicit pause instants and IANA timezones', async () => {
  const dto = Object.assign(new UpdateDailySettingsDto(), settings, {
    notificationsPausedUntil: '2030-10-08T12:00:00Z',
    timezone: 'Asia/Tokyo',
  });
  expect(await validate(dto)).toHaveLength(0);
  dto.timezone = 'Invalid/Timezone';
  expect(await validate(dto)).not.toHaveLength(0);
  dto.timezone = 'UTC';
  dto.notificationsPausedUntil = '2030-10-08';
  expect(await validate(dto)).not.toHaveLength(0);
  dto.notificationsPausedUntil = null;
  expect(await validate(dto)).toHaveLength(0);
});

it('updates only the authenticated profile, persists a Date and allows clearing the pause', async () => {
  const users = {
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    findOneBy: jest.fn().mockResolvedValue({
      ...settings,
      timezone: 'UTC',
      notificationsPausedUntil: null,
    }),
  };
  const service = new NotificationPreferencesService(
    null!,
    users as unknown as Repository<User>,
  );
  await service.updateDailySettings('owner', {
    ...settings,
    timezone: 'UTC',
    notificationsPausedUntil: '2030-10-08T12:00:00Z',
  });
  expect(users.update).toHaveBeenCalledWith(
    { id: 'owner' },
    expect.objectContaining({
      timezone: 'UTC',
      notificationsPausedUntil: new Date('2030-10-08T12:00Z'),
    }),
  );
  await service.updateDailySettings('owner', {
    ...settings,
    notificationsPausedUntil: null,
  });
  expect(users.update).toHaveBeenLastCalledWith(
    { id: 'owner' },
    expect.objectContaining({ notificationsPausedUntil: null }),
  );
  await expect(
    service.updateDailySettings('owner', {
      ...settings,
      notificationsPausedUntil: '2020-10-08T12:00:00Z',
    }),
  ).rejects.toThrow('futur');
});
