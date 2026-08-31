import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryEntity } from '@models/category.entity';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId?: string): Promise<CategoryEntity[]> {
    const categories = await this.prisma.category.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { name: 'asc' },
    });
    return categories.map(CategoryEntity.fromPrisma);
  }

  async findOne(id: string, userId?: string): Promise<CategoryEntity> {
    const category = await this.prisma.category.findFirst({
      where: { id, ...(userId ? { userId } : {}) },
    });
    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }
    return CategoryEntity.fromPrisma(category);
  }

  async create(dto: CreateCategoryDto): Promise<CategoryEntity> {
    await this.assertUserExists(dto.userId);

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        color: dto.color,
        icon: dto.icon,
        userId: dto.userId,
      },
    });
    return CategoryEntity.fromPrisma(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryEntity> {
    await this.findOne(id);
    const category = await this.prisma.category.update({
      where: { id },
      data: dto,
    });
    return CategoryEntity.fromPrisma(category);
  }

  async remove(id: string): Promise<CategoryEntity> {
    await this.findOne(id);
    const category = await this.prisma.category.delete({ where: { id } });
    return CategoryEntity.fromPrisma(category);
  }

  private async assertUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }
  }
}
