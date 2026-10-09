import { validate } from 'class-validator';
import { Repository } from 'typeorm';
import { Task } from '@entities/task.entity';
import { TasksService } from './tasks.service';
import { TaskConflictsQueryDto } from './dto/task-conflicts-query.dto';

it('finds only owned active tasks in the same minute, excluding the edited task', async () => {
  const qb = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(8),
    getMany: jest.fn().mockResolvedValue([{ id: 'other', title: 'Réunion' }]),
  };
  const tasks = { createQueryBuilder: () => qb } as unknown as Repository<Task>;
  const service = new TasksService(tasks, null!, null!, null!);
  expect(
    await service.findConflicts('owner', '2026-10-08T11:30:45+02:00', 'edited'),
  ).toEqual({ total: 8, items: [{ id: 'other', title: 'Réunion' }] });
  expect(qb.where).toHaveBeenCalledWith('task.userId = :userId', {
    userId: 'owner',
  });
  expect(qb.andWhere).toHaveBeenCalledWith(
    'task.deadline >= :from AND task.deadline < :to',
    { from: new Date('2026-10-08T09:30Z'), to: new Date('2026-10-08T09:31Z') },
  );
  expect(qb.andWhere).toHaveBeenCalledWith('task.id != :excludeId', {
    excludeId: 'edited',
  });
  expect(qb.andWhere).toHaveBeenCalledWith('task.status IN (:...statuses)', {
    statuses: ['TODO', 'IN_PROGRESS', 'BLOCKED'],
  });
  expect(qb.take).toHaveBeenCalledWith(5);
});

it('requires a real ISO instant with an explicit timezone', async () => {
  const dto = new TaskConflictsQueryDto();
  dto.deadline = '2026-10-08';
  expect(await validate(dto)).not.toHaveLength(0);
  dto.deadline = '2026-10-08T09:30:00Z';
  expect(await validate(dto)).toHaveLength(0);
  dto.excludeId = 'invalid';
  expect(await validate(dto)).not.toHaveLength(0);
});
