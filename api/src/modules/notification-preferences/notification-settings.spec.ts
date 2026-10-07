import { validate } from 'class-validator';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '@entities/user.entity';
import { NotificationPreferencesService } from './notification-preferences.service';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';

describe('User notification settings', () => {
  it('requires a boolean choice', async () => {
    const dto = new UpdateNotificationSettingsDto();
    expect(await validate(dto)).not.toHaveLength(0);
    dto.notificationsEnabled = false;
    expect(await validate(dto)).toHaveLength(0);
  });
  it('reads and changes only the authenticated user', async () => {
    const users = {
      findOne: jest.fn().mockResolvedValue({ notificationsEnabled: true }),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const service = new NotificationPreferencesService(
      undefined!,
      users as unknown as Repository<User>,
    );
    expect(await service.settings('owner')).toEqual({
      notificationsEnabled: true,
    });
    expect(users.findOne).toHaveBeenCalledWith({ where: { id: 'owner' } });
    expect(await service.updateSettings('owner', false)).toEqual({
      notificationsEnabled: false,
    });
    expect(users.update).toHaveBeenCalledWith(
      { id: 'owner' },
      { notificationsEnabled: false },
    );
    users.update.mockResolvedValue({ affected: 0 });
    await expect(service.updateSettings('missing', true)).rejects.toThrow(
      NotFoundException,
    );
  });
});
