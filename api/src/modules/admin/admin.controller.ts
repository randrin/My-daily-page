import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
  constructor(private readonly service: AdminService) {}
  @Get('overview')
  @ApiOperation({ summary: 'Indicateurs globaux administrateur' })
  overview() {
    return this.service.overview();
  }
  @Get('users')
  @ApiOperation({
    summary: 'Annuaire paginé des utilisateurs, sans contenus privés',
  })
  users(@Query() dto: AdminUsersDto) {
    return this.service.list(dto);
  }
}
