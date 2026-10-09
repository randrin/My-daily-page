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
import { TaskTemplatesService } from './task-templates.service';
import {
  SaveTemplateDto,
  SuggestTemplateDto,
  UpdateTemplateDto,
} from './dto/task-template.dto';

@ApiTags('task-templates')
@ApiJwtAuth()
@UseGuards(JwtAuthGuard)
@Controller('task-templates')
export class TaskTemplatesController {
  constructor(private readonly service: TaskTemplatesService) {}
  @Get()
  @ApiOperation({ summary: 'Mes modèles de tâches' })
  list(@CurrentUser() user: AuthUser) {
    return this.service.findAll(user.id);
  }
  @Get('config')
  @ApiOperation({ summary: 'Disponibilité des suggestions IA' })
  config() {
    return this.service.config();
  }
  @Post('suggestions')
  @ApiOperation({ summary: 'Proposer des étapes sans enregistrer le modèle' })
  suggest(@CurrentUser() user: AuthUser, @Body() input: SuggestTemplateDto) {
    return this.service.suggest(user.id, input);
  }
  @Post()
  @ApiOperation({ summary: 'Créer mon modèle' })
  create(@CurrentUser() user: AuthUser, @Body() input: SaveTemplateDto) {
    return this.service.create(user.id, input);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Modifier mon modèle' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: UpdateTemplateDto,
  ) {
    return this.service.update(id, user.id, input);
  }
  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer mon modèle sans supprimer les tâches créées',
  })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(id, user.id);
  }
}
