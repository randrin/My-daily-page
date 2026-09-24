import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Category } from '@entities/category.entity';
import { pickCategoryColor } from './category-color';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  findAll(userId: string): Promise<Category[]> {
    return this.categories.find({
      where: { userId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Category> {
    const category = await this.categories.findOne({ where: { id, userId } });
    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }
    return category;
  }

  async create(userId: string, dto: CreateCategoryDto): Promise<Category> {
    const category = this.categories.create({
      name: dto.name,
      color: pickCategoryColor(),
      userId,
    });

    try {
      return await this.categories.save(category);
    } catch (error) {
      this.rethrowConstraint(error);
    }
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id, userId);
    if (dto.name !== undefined) {
      category.name = dto.name;
    }

    try {
      return await this.categories.save(category);
    } catch (error) {
      this.rethrowConstraint(error);
    }
  }

  async remove(id: string, userId: string): Promise<Category> {
    const category = await this.findOne(id, userId);
    await this.categories.delete({ id: category.id, userId });
    return category;
  }

  private rethrowConstraint(error: unknown): never {
    if (this.isPgCode(error, '23505')) {
      throw new ConflictException('A category with this name already exists');
    }
    if (this.isPgCode(error, '23503')) {
      throw new NotFoundException('User not found');
    }
    throw error;
  }

  private isPgCode(error: unknown, code: string): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = error.driverError as { code?: string } | undefined;
    return driverError?.code === code;
  }
}
