import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Category } from '@entities/category.entity';
import { Priority, TaskStatus } from '@entities/enums';
import { Reminder } from '@entities/reminder.entity';
import { Task } from '@entities/task.entity';
import { TasksService } from './tasks.service';

type Qb = jest.Mocked<
  Pick<
    SelectQueryBuilder<Task>,
    | 'leftJoinAndSelect'
    | 'where'
    | 'andWhere'
    | 'orderBy'
    | 'addOrderBy'
    | 'addSelect'
    | 'skip'
    | 'take'
    | 'getCount'
    | 'getMany'
  >
>;

function createQb(): Qb {
  const qb = {
    leftJoinAndSelect: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    orderBy: jest.fn(),
    addOrderBy: jest.fn(),
    addSelect: jest.fn(),
    skip: jest.fn(),
    take: jest.fn(),
    getCount: jest.fn(),
    getMany: jest.fn(),
  };
  qb.leftJoinAndSelect.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  qb.andWhere.mockReturnValue(qb);
  qb.orderBy.mockReturnValue(qb);
  qb.addOrderBy.mockReturnValue(qb);
  qb.addSelect.mockReturnValue(qb);
  qb.skip.mockReturnValue(qb);
  qb.take.mockReturnValue(qb);
  return qb;
}

describe('TasksService', () => {
  let service: TasksService;
  let tasks: jest.Mocked<
    Pick<
      Repository<Task>,
      | 'createQueryBuilder'
      | 'findOne'
      | 'create'
      | 'save'
      | 'delete'
    >
  >;
  let countQb: Qb;
  let listQb: Qb;

  const userId = '11111111-1111-1111-1111-111111111111';
  const task = {
    id: 'task-1',
    title: 'Préparer la présentation client',
    description: 'Slides',
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    userId,
  } as Task;

  beforeEach(async () => {
    countQb = createQb();
    listQb = createQb();
    tasks = {
      createQueryBuilder: jest
        .fn()
        .mockReturnValueOnce(countQb)
        .mockReturnValueOnce(listQb),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: tasks },
        { provide: getRepositoryToken(Reminder), useValue: {} },
        { provide: getRepositoryToken(Category), useValue: {} },
      ],
    }).compile();

    service = module.get(TasksService);
  });

  it('pagine et filtre les tâches de l’utilisateur', async () => {
    countQb.getCount.mockResolvedValue(42);
    listQb.getMany.mockResolvedValue([task]);

    const result = await service.findAll(userId, {
      search: 'présentation',
      status: [TaskStatus.TODO],
      priority: [Priority.HIGH],
      categoryId: ['33333333-3333-3333-3333-333333333333'],
      deadlineFrom: '2026-09-01T00:00:00.000Z',
      deadlineTo: '2026-09-30T23:59:59.999Z',
      createdFrom: '2026-08-01T00:00:00.000Z',
      createdTo: '2026-09-22T23:59:59.999Z',
      page: 2,
      pageSize: 20,
    });

    expect(countQb.where).toHaveBeenCalledWith('task.userId = :userId', {
      userId,
    });
    expect(countQb.andWhere).toHaveBeenCalledWith(
      '(task.title ILIKE :search OR COALESCE(task.description, \'\') ILIKE :search)',
      { search: '%présentation%' },
    );
    expect(listQb.skip).toHaveBeenCalledWith(20);
    expect(listQb.take).toHaveBeenCalledWith(20);
    expect(result).toEqual({
      items: [task],
      total: 42,
      page: 2,
      pageSize: 20,
    });
  });

  it('trie par titre quand sortBy est fourni', async () => {
    countQb.getCount.mockResolvedValue(1);
    listQb.getMany.mockResolvedValue([task]);

    await service.findAll(userId, { sortBy: 'title', sortOrder: 'asc' });

    expect(listQb.orderBy).toHaveBeenCalledWith('task.title', 'ASC');
    expect(listQb.addOrderBy).toHaveBeenCalledWith('task.id', 'ASC');
  });

  it('trie le statut via un alias, pas un CASE brut dans orderBy', async () => {
    countQb.getCount.mockResolvedValue(1);
    listQb.getMany.mockResolvedValue([task]);

    await service.findAll(userId, { sortBy: 'status', sortOrder: 'asc' });

    expect(listQb.addSelect).toHaveBeenCalledWith(
      expect.stringContaining('CASE task.status'),
      'sort_status',
    );
    expect(listQb.orderBy).toHaveBeenCalledWith('sort_status', 'ASC');
  });

  it('utilise page 1 et pageSize 10 par défaut', async () => {
    countQb.getCount.mockResolvedValue(0);
    listQb.getMany.mockResolvedValue([]);

    const result = await service.findAll(userId);

    expect(listQb.skip).toHaveBeenCalledWith(0);
    expect(listQb.take).toHaveBeenCalledWith(10);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(listQb.orderBy).toHaveBeenCalledWith('task.createdAt', 'DESC');
  });

  it('filtre les tâches par période createdAt sans pagination', async () => {
    countQb.getCount.mockResolvedValue(3);
    listQb.getMany.mockResolvedValue([task]);

    const result = await service.findInRange(userId, {
      from: '2026-08-23T00:00:00.000Z',
      to: '2026-09-23T23:59:59.999Z',
    });

    expect(countQb.andWhere).toHaveBeenCalledWith(
      'task.createdAt >= :createdFrom',
      { createdFrom: '2026-08-23T00:00:00.000Z' },
    );
    expect(countQb.andWhere).toHaveBeenCalledWith(
      'task.createdAt <= :createdTo',
      { createdTo: '2026-09-23T23:59:59.999Z' },
    );
    expect(listQb.take).toHaveBeenCalledWith(500);
    expect(listQb.skip).not.toHaveBeenCalled();
    expect(result).toEqual({
      items: [task],
      total: 3,
      from: '2026-08-23T00:00:00.000Z',
      to: '2026-09-23T23:59:59.999Z',
    });
  });

  it('rejette une période inversée', async () => {
    await expect(
      service.findInRange(userId, {
        from: '2026-09-23T00:00:00.000Z',
        to: '2026-08-01T00:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('renvoie 404 si la tâche appartient à un autre user', async () => {
    tasks.findOne.mockResolvedValue(null);

    await expect(service.findOne(task.id, userId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
