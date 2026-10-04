import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MemoryObjectStorage } from './memory-object-storage';
import { OBJECT_STORAGE } from './object-storage';
import { S3ObjectStorage } from './s3-object-storage';
import { StorageService } from './storage.service';

const DEFAULT_BUCKET = 'my-daily-page';

@Module({
  providers: [
    {
      provide: OBJECT_STORAGE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const driver = config.get<string>('storage.driver');
        const bucket =
          config.get<string>('minio.bucket') ?? DEFAULT_BUCKET;
        if (driver === 'memory') {
          return new MemoryObjectStorage(bucket, 'http://files.test');
        }
        return new S3ObjectStorage({
          endpoint: config.get<string>('minio.endpoint') ?? 'localhost',
          port: config.get<number>('minio.port') ?? 9000,
          useSsl: config.get<boolean>('minio.useSsl') ?? false,
          accessKey: config.get<string>('minio.accessKey') ?? '',
          secretKey: config.get<string>('minio.secretKey') ?? '',
          bucket,
          publicUrl:
            config.get<string>('minio.publicUrl') ?? 'http://localhost:9000',
        });
      },
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
