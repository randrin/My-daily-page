import { AdminModule } from './modules/admin/admin.module';
import { TaskTemplatesModule } from './modules/task-templates/task-templates.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { QueueModule } from './modules/queue/queue.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { TasksModule } from '@modules/tasks/tasks.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { NotificationPreferencesModule } from './modules/notification-preferences/notification-preferences.module';
import { FilesModule } from './modules/files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    AdminModule,
    TaskTemplatesModule,
    QueueModule,
    AuthModule,
    UsersModule,
    FilesModule,
    TasksModule,
    CategoriesModule,
    NotificationsModule,
    NotificationPreferencesModule,
  ],
})
export class AppModule {}
