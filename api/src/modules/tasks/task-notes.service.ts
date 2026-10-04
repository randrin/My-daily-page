import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '@entities/task.entity';
import { TaskNote } from '@entities/task-note.entity';
import { CreateTaskNoteDto } from './dto/create-task-note.dto';

@Injectable()
export class TaskNotesService {
  constructor(
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    @InjectRepository(TaskNote) private readonly notes: Repository<TaskNote>,
  ) {}

  private async assertOwned(taskId: string, userId: string): Promise<void> {
    if (!(await this.tasks.existsBy({ id: taskId, userId }))) {
      throw new NotFoundException('Task not found');
    }
  }

  async list(taskId: string, userId: string): Promise<TaskNote[]> {
    await this.assertOwned(taskId, userId);
    return this.notes.find({
      where: { taskId },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  async create(
    taskId: string,
    userId: string,
    dto: CreateTaskNoteDto,
  ): Promise<TaskNote> {
    await this.assertOwned(taskId, userId);
    return this.notes.save(this.notes.create({ taskId, content: dto.content }));
  }
}
