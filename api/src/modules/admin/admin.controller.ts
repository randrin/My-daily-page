import { AdminAccess } from './admin-access.decorator';
import { AdminRolesService } from './admin-roles.service';
import { AdminRoleDto } from './dto/admin-role.dto';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AdminAnalyticsDto } from './dto/admin-analytics.dto';
import { AdminNotificationsService } from './admin-notifications.service';
import { AdminNotificationsDto } from './dto/admin-notifications.dto';
import { AdminAuditDto } from './dto/admin-audit.dto';
import { AdminAccountsService } from './admin-accounts.service';
import { AccountStatusDto } from './dto/account-status.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AuthUser } from '@common/types/auth-user';
import { AdminAuditService } from './admin-audit.service';
import {
  Body,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ApiJwtAuth } from '@common/decorators/api-jwt-auth.decorator';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { AdminUsersDto } from './dto/admin-users.dto';
@ApiTags('administration')
@ApiJwtAuth()
@ApiForbiddenResponse({ description: 'Rôle administrateur requis' })
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly service: AdminService,
    private readonly audit: AdminAuditService,
    private readonly accounts: AdminAccountsService,
    private readonly notifications: AdminNotificationsService,
    private readonly analytics: AdminAnalyticsService,
    private readonly roles: AdminRolesService,
  ) {}
  @Patch('users/:id/role')
  @AdminAccess('write')
  @ApiOperation({
    summary:
      'Modifier un rôle après mot de passe et MFA ; action auditée et sessions révoquées',
  })
  changeRole(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: AdminRoleDto,
  ) {
    return this.roles.change(actor.id, id, input);
  }
  @Get('analytics')
  @AdminAccess('read')
  @ApiOperation({
    summary:
      'Courbes d’inscriptions et d’activité réelle par période et fuseau',
  })
  usageAnalytics(@Query() input: AdminAnalyticsDto) {
    return this.analytics.overview(input);
  }
  @Get('notifications')
  @AdminAccess('read')
  @ApiOperation({ summary: 'Supervision agrégée des rappels et coûts estimés' })
  notificationOverview(@Query() input: AdminNotificationsDto) {
    return this.notifications.overview(input);
  }
  @Get('notifications/queues')
  @AdminAccess('read')
  @ApiOperation({ summary: 'État des files BullMQ et workers connectés' })
  notificationQueues() {
    return this.notifications.queues();
  }
  @Post('notifications/:id/retry')
  @AdminAccess('write')
  @ApiOperation({
    summary: 'Demander un réessai audité uniquement après échec avant envoi',
  })
  retryNotification(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notifications.retry(actor.id, id);
  }
  @Get('audit')
  @AdminAccess('read')
  @ApiOperation({
    summary: 'Journal paginé des mutations administratives validées',
  })
  auditEvents(@Query() dto: AdminAuditDto) {
    return this.audit.list(
      dto.page,
      dto.pageSize,
      dto.sortBy,
      dto.sortDirection,
    );
  }
  @Patch('users/:id/status')
  @AdminAccess('write')
  @ApiOperation({
    summary:
      'Suspendre ou réactiver un compte avec audit et révocation des sessions',
  })
  changeStatus(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: AccountStatusDto,
  ) {
    return this.accounts.change(actor.id, id, input);
  }
  @Get('overview')
  @AdminAccess('read')
  @ApiOperation({ summary: 'Indicateurs globaux administrateur' })
  overview() {
    return this.service.overview();
  }
  @Get('users')
  @AdminAccess('read')
  @ApiOperation({
    summary: 'Annuaire paginé des utilisateurs, sans contenus privés',
  })
  users(@Query() dto: AdminUsersDto) {
    return this.service.list(dto);
  }
}
