import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Task } from '@entities/task.entity';
import { TaskNote } from '@entities/task-note.entity';
import { TaskNotesService } from './task-notes.service';
import { CreateTaskNoteDto } from './dto/create-task-note.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('TaskNotesService', () => {
  const tasks = { existsBy: jest.fn() };
  const notes = { find: jest.fn(), create: jest.fn(), save: jest.fn() };
  const service = new TaskNotesService(
    tasks as unknown as Repository<Task>,
    notes as unknown as Repository<TaskNote>,
  );
  beforeEach(() => jest.resetAllMocks());

  it('isole la lecture et la création par utilisateur', async () => {
    tasks.existsBy.mockResolvedValue(false);
    await expect(service.list('task', 'other')).rejects.toThrow(
      NotFoundException,
    );
    await expect(
      service.create('task', 'other', { content: 'note' }),
    ).rejects.toThrow(NotFoundException);
    expect(tasks.existsBy).toHaveBeenCalledWith({
      id: 'task',
      userId: 'other',
    });
    expect(notes.find).not.toHaveBeenCalled();
    expect(notes.save).not.toHaveBeenCalled();
  });

  it('ajoute plusieurs notes sans remplacer les précédentes', async () => {
    tasks.existsBy.mockResolvedValue(true);
    notes.create.mockImplementation((note) => note);
    notes.save.mockImplementation(async (note) => note);
    await service.create('task', 'owner', { content: 'Première' });
    await service.create('task', 'owner', { content: 'Deuxième' });
    expect(notes.save).toHaveBeenCalledTimes(2);
    expect(notes.create).toHaveBeenLastCalledWith({
      taskId: 'task',
      content: 'Deuxième',
    });
  });

  it('charge la timeline du plus récent au plus ancien', async () => {
    tasks.existsBy.mockResolvedValue(true);
    notes.find.mockResolvedValue([]);
    await service.list('task', 'owner');
    expect(notes.find).toHaveBeenCalledWith({
      where: { taskId: 'task' },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  });

  it('rejette les notes vides ou trop longues et retire les espaces', async () => {
    expect(
      await validate(plainToInstance(CreateTaskNoteDto, { content: '   ' })),
    ).not.toHaveLength(0);
    expect(
      await validate(
        plainToInstance(CreateTaskNoteDto, { content: 'x'.repeat(10001) }),
      ),
    ).not.toHaveLength(0);
    const valid = plainToInstance(CreateTaskNoteDto, { content: '  Note  ' });
    expect(await validate(valid)).toHaveLength(0);
    expect(valid.content).toBe('Note');
  });
});
