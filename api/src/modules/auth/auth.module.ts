import { MfaService } from './mfa.service';
import { MfaController } from './mfa.controller';
import { BullModule } from '@nestjs/bullmq';
import { QueueModule } from '../queue/queue.module';
import { EmailProvider } from '../notifications/providers/email.provider';
import {
  PasswordResetService,
  PASSWORD_RESET_QUEUE,
} from './password-reset.service';
import { PasswordResetWorker } from './password-reset.worker';
import { PasswordResetController } from './password-reset.controller';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from '@entities/refresh-token.entity';
import { User } from '@entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    QueueModule,
    BullModule.registerQueue({ name: PASSWORD_RESET_QUEUE }),
    TypeOrmModule.forFeature([User, RefreshToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('jwt.secret'),
        signOptions: {
          expiresIn: 60 * 15,
        },
      }),
    }),
  ],
  controllers: [AuthController, PasswordResetController, MfaController],
  providers: [
    AuthService,
    MfaService,
    JwtStrategy,
    PasswordResetService,
    PasswordResetWorker,
    EmailProvider,
  ],
  exports: [AuthService, MfaService],
})
export class AuthModule {}
