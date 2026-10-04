import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateTaskSettingsDto } from './update-task-settings.dto';
describe('réglages des tâches', () => {
  it('accepte zéro, un délai et la désactivation', async () => {
    for (const defaultDeadlineDays of [0, 7, null]) {
      expect(await validate(plainToInstance(UpdateTaskSettingsDto, { defaultDeadlineDays }))).toHaveLength(0);
    }
  });
  it('rejette les valeurs invalides et manquantes', async () => {
    for (const defaultDeadlineDays of [-1, 1.5, 3651, '7', undefined]) {
      expect(await validate(plainToInstance(UpdateTaskSettingsDto, { defaultDeadlineDays }))).not.toHaveLength(0);
    }
  });
});
