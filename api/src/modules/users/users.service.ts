import { ensureUserContactsUnique } from '../../common/utils/user-contacts';
import { rethrowUserConflict } from '../../common/utils/user-conflict';
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '@entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.users.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.users.findOne({
      where: { id },
      relations: { categories: true, notifChannels: true },
    });
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ where: { email } });
  }

  async create(dto: CreateUserDto): Promise<User> {
    await ensureUserContactsUnique(this.users, dto);
    const user = this.users.create({
      email: dto.email,
      firstName: dto.firstName?.trim() || null,
      lastName: dto.lastName?.trim() || null,
      password: await bcrypt.hash(dto.password, 10),
      phoneNumber: dto.phoneNumber ?? null,
      whatsappNumber: dto.whatsappNumber ?? null,
      timezone: dto.timezone ?? 'Europe/Paris',
    });

    try {
      return await this.users.save(user);
    } catch (error) {
      rethrowUserConflict(error);
    }
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    await ensureUserContactsUnique(this.users, dto, id);
    const { password, ...rest } = dto;
    Object.assign(user, rest);
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    return this.users.save(user).catch(rethrowUserConflict);
  }

  async remove(id: string): Promise<User> {
    const user = await this.findOne(id);
    await this.users.delete({ id });
    return user;
  }

}
