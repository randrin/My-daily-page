import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';
import { UpdateTaskDto } from './update-task.dto';

describe('échéance des tâches', () => {
  it('exige une date ISO à la création', async () => {
    for (const deadline of [undefined, null, '', 'incorrect']) {
      const errors = await validate(plainToInstance(CreateTaskDto, { title: 'Tâche', deadline }));
      expect(errors.some((error) => error.property === 'deadline')).toBe(true);
    }
    expect(await validate(plainToInstance(CreateTaskDto, { title: 'Tâche', deadline: '2026-10-05T00:00:00Z' }))).toHaveLength(0);
  });
  it('permet une modification sans changer l’échéance', async () => {
    expect(await validate(plainToInstance(UpdateTaskDto, { title: 'Titre modifié' }))).toHaveLength(0);
  });
});
