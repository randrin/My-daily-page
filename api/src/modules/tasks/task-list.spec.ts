import { TasksService } from './tasks.service';
import { Task } from '@entities/task.entity';
import { TaskStatus } from '@entities/enums';

describe('create dated list', () => {
  it('saves all items atomically under the authenticated account', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const create = jest.fn((value: Partial<Task>) => value);
    const transaction = jest.fn((work: (manager: unknown) => unknown) =>
      work({ getRepository: () => ({ create, save }) }),
    );
    const service = new TasksService(
      { manager: { transaction } } as never,
      {} as never,
      {} as never,
      {} as never,
    );
    expect(
      await service.createList('owner', {
        tasks: [{ title: ' Item ', deadline: '2099-01-01T10:00:00Z' }],
      }),
    ).toEqual({ created: 1 });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'owner',
        title: 'Item',
        status: TaskStatus.TODO,
      }),
    );
    expect(save).toHaveBeenCalledTimes(1);
    expect(transaction).toHaveBeenCalledTimes(1);
  });
  it('rejects past dates before writing anything', async () => {
    const transaction = jest.fn();
    const service = new TasksService(
      { manager: { transaction } } as never,
      {} as never,
      {} as never,
      {} as never,
    );
    await expect(
      service.createList('owner', {
        tasks: [{ title: 'Item', deadline: '2000-01-01T10:00:00Z' }],
      }),
    ).rejects.toThrow();
    expect(transaction).not.toHaveBeenCalled();
  });
});
