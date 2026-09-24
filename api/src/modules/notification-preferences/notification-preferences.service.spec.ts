import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { NotifChannel } from '@entities/enums';
import { NotificationPreference } from '@entities/notification-preference.entity';
import { NotificationPreferencesService } from './notification-preferences.service';

describe('NotificationPreferencesService', () => {
  let service: NotificationPreferencesService;
  let repo: jest.Mocked<
    Pick<
      Repository<NotificationPreference>,
      'find' | 'findOne' | 'create' | 'save' | 'delete'
    >
  >;

  const userId = '11111111-1111-1111-1111-111111111111';
  const otherUserId = '22222222-2222-2222-2222-222222222222';
  const preference: NotificationPreference = {
    id: '33333333-3333-3333-3333-333333333333',
    userId,
    channel: NotifChannel.EMAIL,
    enabled: true,
    user: undefined as unknown as NotificationPreference['user'],
  };

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationPreferencesService,
        {
          provide: getRepositoryToken(NotificationPreference),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get(NotificationPreferencesService);
  });

  it("liste uniquement les préférences de l'utilisateur", async () => {
    repo.find.mockResolvedValue([preference]);

    const result = await service.findAll(userId);

    expect(repo.find).toHaveBeenCalledWith({
      where: { userId },
      order: { channel: 'ASC' },
    });
    expect(result).toEqual([preference]);
  });

  it('renvoie 404 si la préférence appartient à un autre user', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(
      service.findOne(preference.id, otherUserId),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('crée une préférence pour le user JWT', async () => {
    repo.create.mockReturnValue(preference);
    repo.save.mockResolvedValue(preference);

    const result = await service.create(userId, {
      channel: NotifChannel.EMAIL,
    });

    expect(repo.create).toHaveBeenCalledWith({
      userId,
      channel: NotifChannel.EMAIL,
      enabled: true,
    });
    expect(result).toEqual(preference);
  });

  it('renvoie 409 si le canal existe déjà pour ce user', async () => {
    const driverError = Object.assign(new Error('unique'), { code: '23505' });
    const error = new QueryFailedError('INSERT', [], driverError);

    repo.create.mockReturnValue(preference);
    repo.save.mockRejectedValue(error);

    await expect(
      service.create(userId, { channel: NotifChannel.EMAIL }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('met à jour le flag enabled sans changer le canal', async () => {
    repo.findOne.mockResolvedValue({ ...preference });
    repo.save.mockImplementation(async (row) => row as NotificationPreference);

    const result = await service.update(preference.id, userId, {
      enabled: false,
    });

    expect(result.enabled).toBe(false);
    expect(result.channel).toBe(NotifChannel.EMAIL);
  });
});
