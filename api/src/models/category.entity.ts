import type { PrismaCategory } from './prisma.types';

export class CategoryEntity implements PrismaCategory {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  userId: string;

  constructor(data: Partial<CategoryEntity>) {
    Object.assign(this, data);
  }

  static fromPrisma(this: void, data: PrismaCategory): CategoryEntity {
    return new CategoryEntity(data);
  }
}
