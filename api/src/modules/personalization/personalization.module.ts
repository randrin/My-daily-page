import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@entities/user.entity';
import { QueueModule } from '../queue/queue.module';
import { EmailProvider } from '../notifications/providers/email.provider';
import {
  COMPANION_QUEUE,
  CompanionProcessor,
  CompanionScheduler,
} from './companion-worker';
import { PersonalizationController } from './personalization.controller';
import { PersonalizationService } from './personalization.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    QueueModule,
    BullModule.registerQueue({ name: COMPANION_QUEUE }),
  ],
  controllers: [PersonalizationController],
  providers: [
    PersonalizationService,
    CompanionScheduler,
    CompanionProcessor,
    EmailProvider,
  ],
  exports: [PersonalizationService],
})
export class PersonalizationModule {}
