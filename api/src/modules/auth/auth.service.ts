import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { instanceToPlain } from 'class-transformer';
import { Repository } from 'typeorm';
import { User } from '@entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const user = this.users.create({
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
      phoneNumber: dto.phoneNumber ?? null,
      whatsappNumber: dto.whatsappNumber ?? null,
      timezone: dto.timezone ?? 'Europe/Paris',
    });

    const saved = await this.users.save(user);
    return this.buildAuthResponse(saved);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  async me(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return instanceToPlain(user);
  }

  private async buildAuthResponse(user: User) {
    const access_token = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      access_token,
      user: instanceToPlain(user),
    };
  }
}
