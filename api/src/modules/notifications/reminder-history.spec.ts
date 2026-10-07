import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NotificationsService } from './notifications.service';
import { ReminderHistoryDto } from './dto/reminder-history.dto';
import { NotifChannel, ReminderStatus } from '@entities/enums';
import { Repository } from 'typeorm';
import { Reminder } from '@entities/reminder.entity';

describe('Reminder history pagination', () => {
  it('rejects invalid limits and unsafe sort columns', async () => {
    const dto = plainToInstance(ReminderHistoryDto, {
      page: '0',
      pageSize: '10000',
      sortBy: 'task.password',
    });
    expect((await validate(dto)).map((error) => error.property)).toEqual(
      expect.arrayContaining(['page', 'pageSize', 'sortBy']),
    );
  });

  it('scopes, filters and clamps pagination to the last available page', async () => {
    const query = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(25),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    const repository = {
      createQueryBuilder: () => query,
    } as unknown as Repository<Reminder>;
    const service = new NotificationsService(
      repository,
      undefined!,
      undefined!,
    );
    const dto = plainToInstance(ReminderHistoryDto, {
      page: '9',
      pageSize: '20',
      channel: NotifChannel.EMAIL,
      status: ReminderStatus.SENT,
    });
    const result = await service.history('owner-id', dto);
    expect(query.where).toHaveBeenCalledWith('task.userId = :userId', {
      userId: 'owner-id',
    });
    expect(query.andWhere).toHaveBeenCalledWith('reminder.channel = :channel', {
      channel: NotifChannel.EMAIL,
    });
    expect(query.andWhere).toHaveBeenCalledWith('reminder.status = :status', {
      status: ReminderStatus.SENT,
    });
    expect(query.skip).toHaveBeenCalledWith(20);
    expect(query.take).toHaveBeenCalledWith(20);
    expect(result).toMatchObject({ total: 25, page: 2, pageCount: 2 });
  });
});
