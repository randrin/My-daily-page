export const FILE_KINDS = ['task-image'] as const;

export type FileKind = (typeof FILE_KINDS)[number];

const IMAGE_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const FILE_KIND_RULES: Record<
  FileKind,
  { maxBytes: number; mimeTypes: readonly string[] }
> = {
  'task-image': { maxBytes: 5 * 1024 * 1024, mimeTypes: IMAGE_MIME },
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

export function extensionForMime(mime: string): string | undefined {
  return EXTENSION_BY_MIME[mime];
}

export const FILE_REQUIRED = 'A file is required';
export const FILE_TOO_LARGE = 'File is too large';
export const FILE_INVALID = 'File type is not allowed';
export const FILE_NOT_OWNED = 'This file does not belong to the current user';
export const STORAGE_UNAVAILABLE = 'Object storage is unavailable';
