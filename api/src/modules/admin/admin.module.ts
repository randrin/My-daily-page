import { AdminDataController } from './admin-data.controller';
import { AdminDataService } from './admin-data.service';
import { AuthModule } from '../auth/auth.module';
import { AdminRolesService } from './admin-roles.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserActivityInterceptor } from './user-activity.interceptor';
import { AdminAnalyticsService } from './admin-analytics.service';
import { QueueModule } from '../queue/queue.module';
import { AdminNotificationsService } from './admin-notifications.service';
import { AdminAccountsService } from './admin-accounts.service';
import { AdminAuditService } from './admin-audit.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@entities/user.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
@Module({
  imports: [AuthModule, QueueModule, TypeOrmModule.forFeature([User])],
  controllers: [AdminController, AdminDataController],
  providers: [
    AdminDataService,
    AdminService,
    AdminGuard,
    AdminAuditService,
    AdminAccountsService,
    AdminNotificationsService,
    AdminAnalyticsService,
    AdminRolesService,
    { provide: APP_INTERCEPTOR, useClass: UserActivityInterceptor },
  ],
  exports: [AdminGuard],
})
export class AdminModule {}
