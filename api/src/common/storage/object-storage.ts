export const OBJECT_STORAGE = Symbol('OBJECT_STORAGE');

export type PutObjectInput = {
  key: string;
  body: Buffer;
  contentType: string;
};

export interface ObjectStorage {
  put(input: PutObjectInput): Promise<void>;
  delete(key: string): Promise<void>;
  publicUrl(key: string): string;
  ensureReady(): Promise<void>;
}

export function joinPublicObjectUrl(
  publicBaseUrl: string,
  bucket: string,
  key: string,
): string {
  const root = publicBaseUrl.replace(/\/+$/, '');
  return `${root}/${bucket}/${key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')}`;
}
