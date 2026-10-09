import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AuthUser } from '@common/types/auth-user';
import { ApiJwtAuth } from '@common/decorators/api-jwt-auth.decorator';
import { PushService } from './push.service';
import {
  DeletePushDto,
  PushSubscriptionDto,
} from './dto/push-subscription.dto';
@ApiTags('push')
@ApiJwtAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications/push')
export class PushController {
  constructor(private readonly push: PushService) {}
  @Get('config')
  @ApiOperation({ summary: 'Configuration publique du canal push' })
  config() {
    return { publicKey: this.push.publicKey() };
  }
  @Post('subscribe')
  @ApiOperation({ summary: 'Abonner cet appareil aux rappels' })
  subscribe(@CurrentUser() user: AuthUser, @Body() dto: PushSubscriptionDto) {
    return this.push.subscribe(user.id, dto);
  }
  @Post('unsubscribe')
  @ApiOperation({ summary: 'Désabonner cet appareil' })
  unsubscribe(@CurrentUser() user: AuthUser, @Body() dto: DeletePushDto) {
    return this.push.remove(user.id, dto.endpoint);
  }
}
