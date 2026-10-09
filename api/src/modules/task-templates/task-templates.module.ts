import { TemplateAiService } from './template-ai.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskTemplate } from '../../entities/task-template.entity';
import { TaskTemplatesController } from './task-templates.controller';
import { TaskTemplatesService } from './task-templates.service';
@Module({
  imports: [TypeOrmModule.forFeature([TaskTemplate])],
  controllers: [TaskTemplatesController],
  providers: [TaskTemplatesService, TemplateAiService],
})
export class TaskTemplatesModule {}
