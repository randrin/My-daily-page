import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ApiJwtAuth } from '@common/decorators/api-jwt-auth.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { AuthUser } from '@common/types/auth-user';
import { NotificationPreferencesService } from './notification-preferences.service';
import { CreateNotificationPreferenceDto } from './dto/create-notification-preference.dto';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';
import { toPreferenceResponse } from './preference.mapper';

@ApiTags('notification-preferences')
@ApiJwtAuth()
@Controller('notification-preferences')
@UseGuards(JwtAuthGuard)
export class NotificationPreferencesController {
  constructor(
    private readonly notificationPreferencesService: NotificationPreferencesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Lister les préférences de notification de l’utilisateur',
  })
  async findAll(@CurrentUser() user: AuthUser) {
    const preferences = await this.notificationPreferencesService.findAll(
      user.id,
    );
    return preferences.map(toPreferenceResponse);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’une préférence de notification' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const preference = await this.notificationPreferencesService.findOne(
      id,
      user.id,
    );
    return toPreferenceResponse(preference);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une préférence de notification' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() createNotificationPreferenceDto: CreateNotificationPreferenceDto,
  ) {
    const preference = await this.notificationPreferencesService.create(
      user.id,
      createNotificationPreferenceDto,
    );
    return toPreferenceResponse(preference);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une préférence de notification' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() updateNotificationPreferenceDto: UpdateNotificationPreferenceDto,
  ) {
    const preference = await this.notificationPreferencesService.update(
      id,
      user.id,
      updateNotificationPreferenceDto,
    );
    return toPreferenceResponse(preference);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une préférence de notification' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const preference = await this.notificationPreferencesService.remove(
      id,
      user.id,
    );
    return toPreferenceResponse(preference);
  }
}
