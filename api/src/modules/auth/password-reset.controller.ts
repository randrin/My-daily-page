import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { PasswordResetService } from './password-reset.service';
@ApiTags('auth')
@Controller('auth')
export class PasswordResetController {
  constructor(private readonly service: PasswordResetService) {}
  @Post('forgot-password')
  @HttpCode(202)
  @ApiOperation({
    summary:
      'Demander un lien de réinitialisation (réponse identique pour toute adresse)',
  })
  request(@Body() dto: ForgotPasswordDto) {
    return this.service.request(dto.email);
  }
  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Réinitialiser le mot de passe avec un lien temporaire à usage unique',
  })
  reset(@Body() dto: ResetPasswordDto) {
    return this.service.reset(dto.token, dto.password);
  }
}
