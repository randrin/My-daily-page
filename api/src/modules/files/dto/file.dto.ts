import { IsIn } from 'class-validator';
import { FILE_KINDS, type FileKind } from '../file-kinds';

export class UploadFileDto {
  @IsIn([...FILE_KINDS])
  kind: FileKind;
}

export class StoredFileDto {
  id: string;
  key: string;
  url: string;
  contentType: string;
  size: number;
  originalName: string;
  kind: FileKind;
  createdAt: Date;
}
