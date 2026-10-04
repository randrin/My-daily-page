import {
  ObjectStorage,
  PutObjectInput,
  joinPublicObjectUrl,
} from './object-storage';

export class MemoryObjectStorage implements ObjectStorage {
  private readonly objects = new Map<string, Buffer>();

  constructor(
    private readonly bucket: string,
    private readonly publicBaseUrl: string,
  ) {}

  async put(input: PutObjectInput): Promise<void> {
    this.objects.set(input.key, Buffer.from(input.body));
  }

  async delete(key: string): Promise<void> {
    this.objects.delete(key);
  }

  publicUrl(key: string): string {
    return joinPublicObjectUrl(this.publicBaseUrl, this.bucket, key);
  }

  async ensureReady(): Promise<void> {
    return;
  }

  has(key: string): boolean {
    return this.objects.has(key);
  }
}
