import { SetMetadata } from '@nestjs/common';
export const ADMIN_ACCESS = 'admin:access';
export const AdminAccess = (access: 'read' | 'write' | 'data') =>
  SetMetadata(ADMIN_ACCESS, access);
