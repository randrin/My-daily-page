import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { StoredFile } from '@entities/stored-file.entity';
import { StorageService } from '@common/storage/storage.service';
import { StoredFileDto } from './dto/file.dto';
import {
  FILE_INVALID,
  FILE_KIND_RULES,
  FILE_NOT_OWNED,
  FILE_REQUIRED,
  FILE_TOO_LARGE,
  STORAGE_UNAVAILABLE,
  type FileKind,
  extensionForMime,
} from './file-kinds';

export type IncomingFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    @InjectRepository(StoredFile)
    private readonly files: Repository<StoredFile>,
    private readonly storage: StorageService,
    private readonly config: ConfigService,
  ) {}

  async upload(
    userId: string,
    file: IncomingFile | undefined,
    kind: FileKind,
  ): Promise<StoredFileDto> {
    if (!file || !file.buffer || file.size === 0) {
      throw new BadRequestException(FILE_REQUIRED);
    }

    const rules = FILE_KIND_RULES[kind];
    if (!rules) {
      throw new BadRequestException(FILE_INVALID);
    }
    if (file.size > rules.maxBytes) {
      throw new BadRequestException(FILE_TOO_LARGE);
    }

    const contentType = file.mimetype;
    if (!rules.mimeTypes.includes(contentType)) {
      throw new BadRequestException(FILE_INVALID);
    }

    const extension = extensionForMime(contentType);
    if (!extension) {
      throw new BadRequestException(FILE_INVALID);
    }

    const year = new Date().getUTCFullYear();
    const key = `${kind}/${userId}/${year}/${randomUUID()}${extension}`;
    const bucket = this.bucketName();

    try {
      await this.storage.put({
        key,
        body: file.buffer,
        contentType,
      });
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : 'Object storage put failed',
      );
      throw new ServiceUnavailableException(STORAGE_UNAVAILABLE);
    }

    const saved = await this.files.save(
      this.files.create({
        key,
        bucket,
        contentType,
        size: file.size,
        originalName: sanitizeOriginalName(file.originalname),
        kind,
        userId,
      }),
    );
    return this.toDto(saved);
  }

  async remove(id: string, userId: string): Promise<void> {
    const row = await this.files.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`File with id "${id}" not found`);
    }
    if (row.userId !== userId) {
      throw new ForbiddenException(FILE_NOT_OWNED);
    }
    await this.deleteStored(row);
  }

  async normalizeOwnedUrl(
    userId: string,
    url: string | null | undefined,
  ): Promise<string | null> {
    if (url == null || url.trim() === '') {
      return null;
    }
    const key = this.keyFromPublicUrl(url);
    if (!key || !key.startsWith(`task-image/${userId}/`)) {
      throw new BadRequestException(FILE_NOT_OWNED);
    }
    return this.storage.publicUrl(key);
  }

  async removeByUrl(
    userId: string,
    url: string | null | undefined,
  ): Promise<void> {
    if (!url) return;
    const key = this.keyFromPublicUrl(url);
    if (!key || !key.startsWith(`task-image/${userId}/`)) {
      return;
    }
    const row = await this.files.findOne({ where: { key, userId } });
    if (row) {
      await this.deleteStored(row);
      return;
    }
    try {
      await this.storage.delete(key);
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : 'Object storage delete failed',
      );
    }
  }

  private async deleteStored(row: StoredFile): Promise<void> {
    try {
      await this.storage.delete(row.key);
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : 'Object storage delete failed',
      );
      throw new ServiceUnavailableException(STORAGE_UNAVAILABLE);
    }
    await this.files.remove(row);
  }

  private keyFromPublicUrl(url: string): string | null {
    const prefix = `${this.publicBaseUrl().replace(/\/+$/, '')}/${this.bucketName()}/`;
    if (!url.startsWith(prefix)) {
      return null;
    }
    return url
      .slice(prefix.length)
      .split('/')
      .map((segment) => decodeURIComponent(segment))
      .join('/');
  }

  private bucketName(): string {
    if (this.config.get<string>('storage.driver') === 'memory') {
      return this.config.get<string>('minio.bucket') ?? 'my-daily-page';
    }
    return this.config.get<string>('minio.bucket') ?? 'my-daily-page';
  }

  private publicBaseUrl(): string {
    if (this.config.get<string>('storage.driver') === 'memory') {
      return 'http://files.test';
    }
    return this.config.get<string>('minio.publicUrl') ?? 'http://localhost:9000';
  }

  private toDto(row: StoredFile): StoredFileDto {
    return {
      id: row.id,
      key: row.key,
      url: this.storage.publicUrl(row.key),
      contentType: row.contentType,
      size: row.size,
      originalName: row.originalName,
      kind: row.kind as FileKind,
      createdAt: row.createdAt,
    };
  }
}

function sanitizeOriginalName(name: string): string {
  const trimmed = name.replace(/[/\\]/g, '').trim();
  return (trimmed || 'upload').slice(0, 255);
}
