import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserEntity } from '@models/user.entity';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const userInclude = {
  categories: true,
  notifChannels: true,
} satisfies Prisma.UserInclude;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map(UserEntity.fromPrisma);
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return UserEntity.fromPrisma(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? UserEntity.fromPrisma(user) : null;
  }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: dto.password, // hash via auth module
        phoneNumber: dto.phoneNumber,
        whatsappNumber: dto.whatsappNumber,
        timezone: dto.timezone ?? 'Europe/Paris',
      },
    });
    return UserEntity.fromPrisma(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    await this.findOne(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
    });
    return UserEntity.fromPrisma(user);
  }

  async remove(id: string): Promise<UserEntity> {
    await this.findOne(id);
    const user = await this.prisma.user.delete({ where: { id } });
    return UserEntity.fromPrisma(user);
  }
}
