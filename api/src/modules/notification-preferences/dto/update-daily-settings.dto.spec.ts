import { validate } from 'class-validator';
import { UpdateDailySettingsDto } from './update-daily-settings.dto';

it('requires booleans and strict HH:mm times', async () => {
  const dto = Object.assign(new UpdateDailySettingsDto(), {
    dailyDigestEnabled: true,
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    quietHoursAllowUrgent: false,
  });
  expect(await validate(dto)).toHaveLength(0);
  dto.quietHoursStart = '25:00';
  expect(await validate(dto)).not.toHaveLength(0);
  dto.quietHoursStart = '7:00';
  expect(await validate(dto)).not.toHaveLength(0);
});
