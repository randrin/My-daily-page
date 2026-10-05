import { ConflictException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

export function rethrowUserConflict(error: unknown): never {
  if (error instanceof QueryFailedError) {
    const driver = error.driverError as { code?: string; constraint?: string };
    if (driver.code === '23505') {
      const field = driver.constraint?.includes('whatsapp') ? 'WhatsApp number' : driver.constraint?.includes('phone') ? 'Phone number' : 'Email';
      throw new ConflictException(`${field} already in use`);
    }
  }
  throw error;
}
