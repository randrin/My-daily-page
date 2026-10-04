import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  OBJECT_STORAGE,
  ObjectStorage,
  PutObjectInput,
} from './object-storage';

@Injectable()
export class StorageService implements OnModuleInit {
  constructor(@Inject(OBJECT_STORAGE) private readonly driver: ObjectStorage) {}

  async onModuleInit(): Promise<void> {
    await this.driver.ensureReady();
  }

  put(input: PutObjectInput): Promise<void> {
    return this.driver.put(input);
  }

  delete(key: string): Promise<void> {
    return this.driver.delete(key);
  }

  publicUrl(key: string): string {
    return this.driver.publicUrl(key);
  }
}
