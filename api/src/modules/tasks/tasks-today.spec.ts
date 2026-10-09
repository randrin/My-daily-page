import { Repository } from 'typeorm';
import { Task } from '@entities/task.entity';
import { Category } from '@entities/category.entity';
import { Reminder } from '@entities/reminder.entity';
import { TasksService } from './tasks.service';
import { FilesService } from '../files/files.service';

function fixture(timezone: string) {
  const qb = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    clone: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValueOnce(5).mockResolvedValueOnce(2),
    getMany: jest.fn().mockResolvedValue([{ id: 'first' }, { id: 'second' }]),
  };
  const tasks = {
    manager: { findOneBy: jest.fn().mockResolvedValue({ timezone }) },
    createQueryBuilder: jest.fn().mockReturnValue(qb),
    find: jest.fn().mockResolvedValue([{ id: 'second' }, { id: 'first' }]),
  };
  const service = new TasksService(
    tasks as unknown as Repository<Task>,
    {} as Repository<Reminder>,
    {} as Repository<Category>,
    {} as FilesService,
  );
  return { service, tasks, qb };
}

describe('Page du jour', () => {
  it.each([
    ['Europe/Paris', '2026-10-07T23:30:00Z', '2026-10-08'],
    ['America/New_York', '2026-10-07T00:30:00Z', '2026-10-06'],
    ['Europe/Paris', '2026-10-25T01:30:00Z', '2026-10-25'],
  ])('uses the profile date in %s', async (timezone, instant, date) => {
    const { service, qb } = fixture(timezone);
    const result = await service.findToday('owner', new Date(instant));
    expect(result.date).toBe(date);
    expect(qb.where).toHaveBeenCalledWith('task.userId = :userId', {
      userId: 'owner',
    });
    expect(qb.andWhere).toHaveBeenCalledWith(
      'CAST(task.deadline AT TIME ZONE :timezone AS date) = CAST(:date AS date)',
      { timezone, date },
    );
    expect(result.items.map((task) => task.id)).toEqual(['first', 'second']);
    expect(result.total).toBe(5);
    expect(result.completed).toBe(2);
    expect(qb.take).toHaveBeenCalledWith(3);
    expect(qb.orderBy).toHaveBeenCalledWith(
      expect.stringContaining("WHEN 'URGENT' THEN 0"),
      'ASC',
    );
    expect(qb.andWhere).toHaveBeenCalledWith('task.status != :archived', {
      archived: 'ARCHIVED',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('task.status != :done', {
      done: 'DONE',
    });
  });

  it('does not hydrate unrelated tasks when the day is empty', async () => {
    const { service, tasks, qb } = fixture('Europe/Paris');
    qb.getMany.mockResolvedValue([]);
    expect((await service.findToday('owner')).items).toEqual([]);
    expect(tasks.find).not.toHaveBeenCalled();
  });
});
