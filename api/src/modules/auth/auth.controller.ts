import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ApiJwtAuth } from '@common/decorators/api-jwt-auth.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { AuthUser } from '@common/types/auth-user';
import { AuthService } from './auth.service';
import { AuthResponseDto, AuthUserResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { LogoutDto } from './dto/logout.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Créer un compte' })
  @ApiCreatedResponse({
    description: 'Compte créé. `access_token` + `refresh_token`.',
    type: AuthResponseDto,
  })
  @ApiConflictResponse({ description: 'Email déjà utilisé' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Se connecter' })
  @ApiOkResponse({
    description: 'JWT d’accès, refresh token et profil.',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Identifiants invalides' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Renouveler les tokens (rotation du refresh token)',
  })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Refresh token invalide ou révoqué' })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refresh_token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiJwtAuth()
  @ApiOperation({
    summary: 'Révoquer le refresh token (ou tous les tokens de l’utilisateur)',
  })
  @ApiOkResponse({ description: 'Session révoquée' })
  logout(@CurrentUser() user: AuthUser, @Body() dto: LogoutDto) {
    return this.authService.logout(user.id, dto.refresh_token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiJwtAuth()
  @ApiOperation({ summary: 'Profil de l’utilisateur connecté' })
  @ApiOkResponse({ type: AuthUserResponseDto })
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.id);
  }
}
