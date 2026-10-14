import { Body, Controller, Get, Post, UseGuards, Header } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiJwtAuth } from '@common/decorators/api-jwt-auth.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AuthUser } from '@common/types/auth-user';
import { MfaService } from './mfa.service';
import { MfaConfirmDto, MfaDisableDto, MfaPasswordDto } from './dto/mfa.dto';
@ApiTags('security')
@ApiJwtAuth()
@UseGuards(JwtAuthGuard)
@Controller('auth/mfa')
export class MfaController {
  constructor(private readonly mfa: MfaService) {}
  @Get() @ApiOperation({ summary: 'État MFA personnel, sans secret' }) status(
    @CurrentUser() user: AuthUser,
  ) {
    return this.mfa.status(user.id);
  }
  @Post('setup')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary:
      'Préparer un secret chiffré et des codes de récupération après réauthentification',
  })
  setup(@CurrentUser() user: AuthUser, @Body() input: MfaPasswordDto) {
    return this.mfa.setup(user.id, input.password);
  }
  @Post('cancel')
  cancel(@CurrentUser() user: AuthUser) {
    return this.mfa.cancel(user.id);
  }
  @Post('confirm')
  @ApiOperation({
    summary: 'Confirmer la MFA avec un TOTP valide et révoquer les sessions',
  })
  confirm(@CurrentUser() user: AuthUser, @Body() input: MfaConfirmDto) {
    return this.mfa.confirm(user.id, input.code);
  }
  @Post('disable')
  @ApiOperation({
    summary:
      'Désactiver la MFA après mot de passe et second facteur, action auditée',
  })
  disable(@CurrentUser() user: AuthUser, @Body() input: MfaDisableDto) {
    return this.mfa.disable(user.id, input.password, input.code);
  }
}
