import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { FilesService } from './files.service';
import {
  FILE_INVALID,
  FILE_NOT_OWNED,
  FILE_REQUIRED,
  FILE_TOO_LARGE,
} from './file-kinds';
import { MemoryObjectStorage } from '@common/storage/memory-object-storage';
import { StorageService } from '@common/storage/storage.service';

function jpegBuffer(): Buffer {
  return Buffer.from([0xff, 0xd8, 0xff, 0xd9, 0x00, 0x01, 0x02, 0x03]);
}

describe('FilesService', () => {
  const userId = '11111111-1111-4111-8111-111111111111';
  const otherUser = '22222222-2222-4222-8222-222222222222';
  let storage: MemoryObjectStorage;
  let filesRepo: {
    save: jest.Mock;
    create: jest.Mock;
    findOne: jest.Mock;
    remove: jest.Mock;
  };
  let service: FilesService;

  beforeEach(() => {
    storage = new MemoryObjectStorage('my-daily-page', 'http://files.test');
    const storageService = {
      put: (input: { key: string; body: Buffer; contentType: string }) =>
        storage.put(input),
      delete: (key: string) => storage.delete(key),
      publicUrl: (key: string) => storage.publicUrl(key),
    } as unknown as StorageService;

    filesRepo = {
      save: jest.fn(async (row) => ({
        ...row,
        id: 'file-1',
        createdAt: new Date('2026-09-28T00:00:00.000Z'),
      })),
      create: jest.fn((row) => row),
      findOne: jest.fn(),
      remove: jest.fn(async (row) => row),
    };

    service = new FilesService(
      filesRepo as never,
      storageService,
      {
        get: (key: string) => {
          if (key === 'storage.driver') return 'memory';
          if (key === 'minio.bucket') return 'my-daily-page';
          if (key === 'minio.publicUrl') return 'http://files.test';
          return undefined;
        },
      } as never,
    );
  });

  it('upload une image jpeg et retourne une URL publique', async () => {
    const result = await service.upload(userId, {
      originalname: 'photo.jpg',
      mimetype: 'image/jpeg',
      size: 8,
      buffer: jpegBuffer(),
    }, 'task-image');

    expect(result.url).toMatch(
      /^http:\/\/files\.test\/my-daily-page\/task-image\/11111111-1111-4111-8111-111111111111\/\d{4}\/.+\.jpg$/,
    );
    expect(result.contentType).toBe('image/jpeg');
    expect(filesRepo.save).toHaveBeenCalled();
  });

  it('refuse un fichier vide', async () => {
    await expect(
      service.upload(userId, undefined, 'task-image'),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.upload(userId, undefined, 'task-image'),
    ).rejects.toMatchObject({ message: FILE_REQUIRED });
  });

  it('refuse un type non image', async () => {
    await expect(
      service.upload(
        userId,
        {
          originalname: 'notes.pdf',
          mimetype: 'application/pdf',
          size: 8,
          buffer: jpegBuffer(),
        },
        'task-image',
      ),
    ).rejects.toMatchObject({ message: FILE_INVALID });
  });

  it('refuse un fichier trop lourd', async () => {
    await expect(
      service.upload(
        userId,
        {
          originalname: 'huge.jpg',
          mimetype: 'image/jpeg',
          size: 6 * 1024 * 1024,
          buffer: jpegBuffer(),
        },
        'task-image',
      ),
    ).rejects.toMatchObject({ message: FILE_TOO_LARGE });
  });

  it('n’autorise que les URLs du user courant', async () => {
    const stored = await service.upload(userId, {
      originalname: 'photo.jpg',
      mimetype: 'image/jpeg',
      size: 8,
      buffer: jpegBuffer(),
    }, 'task-image');

    await expect(service.normalizeOwnedUrl(userId, stored.url)).resolves.toBe(
      stored.url,
    );
    await expect(
      service.normalizeOwnedUrl(otherUser, stored.url),
    ).rejects.toMatchObject({ message: FILE_NOT_OWNED });
    await expect(service.normalizeOwnedUrl(userId, null)).resolves.toBe(null);
  });

  it('interdit de supprimer le fichier d’un autre user', async () => {
    filesRepo.findOne.mockResolvedValue({
      id: 'file-1',
      key: `task-image/${userId}/2026/abc.jpg`,
      userId,
    });

    await expect(service.remove('file-1', otherUser)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
