import { PersonalizationModule } from '../personalization/personalization.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '@entities/category.entity';
import { Reminder } from '@entities/reminder.entity';
import { TaskNote } from '@entities/task-note.entity';
import { TaskNotesService } from './task-notes.service';
import { Task } from '@entities/task.entity';
import { FilesModule } from '../files/files.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Reminder, Category, TaskNote]),
    FilesModule,
    PersonalizationModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, TaskNotesService],
  exports: [TasksService],
})
export class TasksModule {}
