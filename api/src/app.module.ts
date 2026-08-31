import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './modules/prisma/prisma.module';
import { QueueModule } from './modules/queue/queue.module';
import { UsersModule } from '@modules/users/users.module';
import { TasksModule } from '@modules/tasks/tasks.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    QueueModule,
    UsersModule,
    TasksModule,
    CategoriesModule,
    NotificationsModule,
  ],
})
export class AppModule {}
