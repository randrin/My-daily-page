import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AuthUser } from '@common/types/auth-user';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ApiJwtAuth } from '@common/decorators/api-jwt-auth.decorator';
import { AssistantService } from './assistant.service';
import { ConfirmAssistantDto, SuggestAssistantDto } from './dto/assistant.dto';
@ApiTags('assistant')
@ApiJwtAuth()
@UseGuards(JwtAuthGuard)
@Controller('assistant')
export class AssistantController {
  constructor(private readonly service: AssistantService) {}
  @Get('drafts')
  @ApiOperation({ summary: 'Propositions personnelles à confirmer' })
  drafts(@CurrentUser() user: AuthUser) {
    return this.service.drafts(user.id);
  }
  @Post('suggest')
  @ApiOperation({ summary: 'Proposer sans créer : mode guidé ou IA explicite' })
  suggest(@CurrentUser() user: AuthUser, @Body() dto: SuggestAssistantDto) {
    return this.service.suggest(user.id, dto);
  }
  @Post('drafts/:id/confirm')
  @ApiOperation({
    summary:
      'Créer atomiquement les tâches sélectionnées, confirmation idempotente',
  })
  confirm(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfirmAssistantDto,
  ) {
    return this.service.confirm(user.id, id, dto);
  }
  @Get('brief')
  @ApiOperation({
    summary: 'Quoi, pourquoi et ordre du jour, sans transmission externe',
  })
  brief(@CurrentUser() user: AuthUser) {
    return this.service.brief(user.id);
  }
  @Get('review')
  @ApiOperation({
    summary: 'Revue glissante sur 7 jours : échéances dépassées et blocages',
  })
  review(@CurrentUser() user: AuthUser) {
    return this.service.review(user.id);
  }
}
