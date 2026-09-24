import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Category } from '@entities/category.entity';
import * as categoryColor from './category-color';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repo: jest.Mocked<
    Pick<Repository<Category>, 'find' | 'findOne' | 'create' | 'save' | 'delete'>
  >;

  const userId = '11111111-1111-1111-1111-111111111111';
  const otherUserId = '22222222-2222-2222-2222-222222222222';
  const category: Category = {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'work',
    color: '#3b82f6',
    userId,
    user: undefined as unknown as Category['user'],
    tasks: [],
  };

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getRepositoryToken(Category), useValue: repo },
      ],
    }).compile();

    service = module.get(CategoriesService);
  });

  it("liste uniquement les catégories de l'utilisateur", async () => {
    repo.find.mockResolvedValue([category]);

    const result = await service.findAll(userId);

    expect(repo.find).toHaveBeenCalledWith({
      where: { userId },
      order: { name: 'ASC' },
    });
    expect(result).toEqual([category]);
  });

  it('renvoie 404 si la catégorie appartient à un autre user', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(
      service.findOne(category.id, otherUserId),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('crée une catégorie avec une couleur générée côté serveur', async () => {
    const pick = jest
      .spyOn(categoryColor, 'pickCategoryColor')
      .mockReturnValue('#ec4899');
    repo.create.mockReturnValue({ ...category, color: '#ec4899' });
    repo.save.mockResolvedValue({ ...category, color: '#ec4899' });

    const result = await service.create(userId, { name: 'work' });

    expect(pick).toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalledWith({
      name: 'work',
      color: '#ec4899',
      userId,
    });
    expect(result.color).toBe('#ec4899');
    pick.mockRestore();
  });

  it('renvoie 409 si le nom existe déjà pour ce user', async () => {
    const driverError = Object.assign(new Error('unique'), { code: '23505' });
    const error = new QueryFailedError('INSERT', [], driverError);

    repo.create.mockReturnValue(category);
    repo.save.mockRejectedValue(error);

    await expect(
      service.create(userId, { name: 'work' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('met à jour le nom sans régénérer la couleur', async () => {
    repo.findOne.mockResolvedValue({ ...category });
    repo.save.mockImplementation(async (row) => row as Category);

    const result = await service.update(category.id, userId, {
      name: 'bureau',
    });

    expect(result.name).toBe('bureau');
    expect(result.color).toBe('#3b82f6');
  });
});
