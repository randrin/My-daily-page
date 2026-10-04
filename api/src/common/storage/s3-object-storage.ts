import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Logger } from '@nestjs/common';
import {
  ObjectStorage,
  PutObjectInput,
  joinPublicObjectUrl,
} from './object-storage';

export type S3ObjectStorageOptions = {
  endpoint: string;
  port: number;
  useSsl: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
  publicUrl: string;
};

export class S3ObjectStorage implements ObjectStorage {
  private readonly logger = new Logger(S3ObjectStorage.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(options: S3ObjectStorageOptions) {
    const protocol = options.useSsl ? 'https' : 'http';
    this.bucket = options.bucket;
    this.publicBaseUrl = options.publicUrl;
    this.client = new S3Client({
      region: 'us-east-1',
      endpoint: `${protocol}://${options.endpoint}:${options.port}`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: options.accessKey,
        secretAccessKey: options.secretKey,
      },
    });
  }

  async put(input: PutObjectInput): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
      }),
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  publicUrl(key: string): string {
    return joinPublicObjectUrl(this.publicBaseUrl, this.bucket, key);
  }

  async ensureReady(): Promise<void> {
    try {
      await this.ensureBucket();
      await this.client.send(
        new PutBucketPolicyCommand({
          Bucket: this.bucket,
          Policy: JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: { AWS: ['*'] },
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${this.bucket}/*`],
              },
            ],
          }),
        }),
      );
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : 'MinIO is unavailable',
      );
      throw error;
    }
  }

  private async ensureBucket(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch (error) {
      if (!isMissingBucket(error)) {
        throw error;
      }
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
  }
}

function isMissingBucket(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const name = 'name' in error ? String(error.name) : '';
  const metadata =
    '$metadata' in error && typeof error.$metadata === 'object'
      ? (error.$metadata as { httpStatusCode?: number })
      : undefined;
  return (
    name === 'NotFound' ||
    name === 'NoSuchBucket' ||
    metadata?.httpStatusCode === 404
  );
}
