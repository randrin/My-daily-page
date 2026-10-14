import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiJwtAuth } from '@common/decorators/api-jwt-auth.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AuthUser } from '@common/types/auth-user';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PersonalizationService } from './personalization.service';
import {
  RespondCompanionDto,
  CompanionTokenDto,
  EnabledDto,
  InviteCompanionDto,
  TaskDefaultsDto,
} from './dto/personalization.dto';
@ApiTags('personalization')
@ApiJwtAuth()
@UseGuards(JwtAuthGuard)
@Controller('personalization')
export class PersonalizationController {
  constructor(private readonly service: PersonalizationService) {}
  @Get('defaults')
  @ApiOperation({ summary: 'Valeurs par défaut personnelles' })
  defaults(@CurrentUser() u: AuthUser) {
    return this.service.defaults(u.id);
  }
  @Put('defaults')
  @ApiOperation({ summary: 'Enregistrer les valeurs par défaut' })
  updateDefaults(@CurrentUser() u: AuthUser, @Body() d: TaskDefaultsDto) {
    return this.service.updateDefaults(u.id, d);
  }
  @Get('energy')
  @ApiOperation({
    summary:
      'Créneaux observés après consentement, sans modification des tâches',
  })
  energy(@CurrentUser() u: AuthUser) {
    return this.service.energy(u.id);
  }
  @Put('energy')
  @ApiOperation({
    summary:
      'Activer les observations ou les désactiver en effaçant les événements',
  })
  setEnergy(@CurrentUser() u: AuthUser, @Body() d: EnabledDto) {
    return this.service.setEnergy(u.id, d.enabled);
  }
  @Get('deliveries')
  @ApiOperation({
    summary: 'Vingt dernières alertes de mes binômes, sans contenu de tâche',
  })
  deliveries(@CurrentUser() u: AuthUser) {
    return this.service.deliveries(u.id);
  }
  @Get('companions')
  @ApiOperation({ summary: 'Mes invitations et binômes' })
  pairs(@CurrentUser() u: AuthUser) {
    return this.service.pairs(u.id);
  }
  @Post('companions')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary:
      'Créer une invitation privée à partager manuellement, valable sept jours',
  })
  invite(@CurrentUser() u: AuthUser, @Body() d: InviteCompanionDto) {
    return this.service.invite(u.id, d);
  }
  @Post('invitation/inspect')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary:
      'Lire une invitation destinée à son email ; aucune acceptation automatique',
  })
  invitation(@CurrentUser() u: AuthUser, @Body() q: CompanionTokenDto) {
    return this.service.invitation(u.id, q.token);
  }
  @Post('invitation/accept')
  @ApiOperation({
    summary: 'Accepter explicitement le partage minimal et les alertes email',
  })
  accept(@CurrentUser() u: AuthUser, @Body() d: RespondCompanionDto) {
    return this.service.respond(u.id, d.token, d.consent);
  }
  @Post('invitation/decline')
  @ApiOperation({ summary: 'Refuser une invitation' })
  decline(@CurrentUser() u: AuthUser, @Body() q: CompanionTokenDto) {
    return this.service.respond(u.id, q.token, false);
  }
  @Put('companions/:id')
  @ApiOperation({ summary: 'Suspendre ou réactiver sa participation' })
  updatePair(
    @CurrentUser() u: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() d: EnabledDto,
  ) {
    return this.service.updatePair(u.id, id, d.enabled);
  }
  @Post('companions/:id/revoke')
  @ApiOperation({
    summary: 'Révoquer la relation et empêcher les futurs envois',
  })
  revoke(@CurrentUser() u: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.updatePair(u.id, id, null);
  }
}
