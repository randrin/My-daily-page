import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiJwtAuth } from '@common/decorators/api-jwt-auth.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AuthUser } from '@common/types/auth-user';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminAccess } from './admin-access.decorator';
import { AdminDataService } from './admin-data.service';
import {
  AdminDataPageDto,
  AdminExportDto,
  RetentionHoldDto,
  RetentionPolicyDto,
  RetentionPurgeDto,
} from './dto/admin-data.dto';
import { MfaDisableDto } from '../auth/dto/mfa.dto';
@ApiTags('administration-data')
@ApiJwtAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@AdminAccess('data')
@Controller('admin/data')
export class AdminDataController {
  constructor(private readonly service: AdminDataService) {}
  @Get('exports')
  @ApiOperation({
    summary: 'Exports privés de l’administrateur connecté, paginés',
  })
  exports(@CurrentUser() actor: AuthUser, @Query() input: AdminDataPageDto) {
    return this.service.exports(actor.id, input);
  }
  @Post('exports')
  @ApiOperation({
    summary: 'Créer un CSV minimisé, après MFA ; maximum 10 000 comptes',
  })
  create(@CurrentUser() actor: AuthUser, @Body() input: AdminExportDto) {
    return this.service.createExport(actor.id, input);
  }
  @Post('exports/:id/download')
  @Header('Cache-Control', 'no-store')
  @Header('X-Content-Type-Options', 'nosniff')
  @ApiOperation({
    summary: 'Télécharger son CSV avec audit ; expiration après quinze minutes',
  })
  async download(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return new StreamableFile(await this.service.download(actor.id, id), {
      type: 'text/csv; charset=utf-8',
      disposition: `attachment; filename="comptes-${id}.csv"`,
    });
  }
  @Get('retention')
  @ApiOperation({
    summary: 'Politique, exceptions actives et vingt dernières purges',
  })
  retention() {
    return this.service.retention();
  }
  @Put('retention')
  @ApiOperation({
    summary: 'Configurer la conservation avec réauthentification MFA',
  })
  policy(@CurrentUser() actor: AuthUser, @Body() input: RetentionPolicyDto) {
    return this.service.updatePolicy(actor.id, input);
  }
  @Post('holds')
  @ApiOperation({ summary: 'Protéger un enregistrement contre la purge' })
  hold(@CurrentUser() actor: AuthUser, @Body() input: RetentionHoldDto) {
    return this.service.hold(actor.id, input);
  }
  @Post('holds/:id/release')
  @ApiOperation({ summary: 'Lever une exception avec MFA et audit' })
  release(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: MfaDisableDto,
  ) {
    return this.service.release(actor.id, id, input);
  }
  @Post('retention/preview')
  @ApiOperation({
    summary: 'Préparer un lot de purge borné, valable dix minutes',
  })
  preview(@CurrentUser() actor: AuthUser) {
    return this.service.preview(actor.id);
  }
  @Post('retention/purge')
  @ApiOperation({
    summary: 'Exécuter le lot approuvé avec MFA et confirmation explicite',
  })
  purge(@CurrentUser() actor: AuthUser, @Body() input: RetentionPurgeDto) {
    return this.service.purge(actor.id, input);
  }
}
