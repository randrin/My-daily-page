import { Module } from '@nestjs/common';
import { TasksModule } from '../tasks/tasks.module';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
@Module({
  imports: [TasksModule],
  controllers: [AssistantController],
  providers: [AssistantService],
})
export class AssistantModule {}
