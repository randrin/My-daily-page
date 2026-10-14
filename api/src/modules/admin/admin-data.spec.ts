import { ValidationPipe } from '@nestjs/common';
import { csvCell, userExportCsv } from './admin-csv';
import {
  AdminExportDto,
  RetentionPolicyDto,
  RetentionPurgeDto,
} from './dto/admin-data.dto';
describe('Minimized exports and retention input', () => {
  it.each([
    '=HYPERLINK("evil")',
    ' +SUM(1,2)',
    '-1+2',
    '@SUM(A1)',
    '\tformula',
    '\rformula',
    '\u0000=1',
  ])('neutralizes spreadsheet formula %p', (value) => {
    expect(csvCell(value).startsWith('"\'')).toBe(true);
  });
  it('escapes quotes/separators and exports only allowlisted fields', () => {
    expect(csvCell('a;"b')).toBe('"a;""b"');
    const row = {
      id: 'safe-id',
      role: 'user',
      account: 'Actif',
      createdAt: '2026-10-13T00:00:00Z',
      tasks: 1,
      email: 'secret@example.invalid',
      password: 'hidden',
    };
    const csv = userExportCsv([row]);
    expect(csv).not.toContain('secret');
    expect(csv).not.toContain('hidden');
    expect(csv).toContain('safe-id');
  });
  it('rejects extra fields, unsafe durations and unconfirmed purges', async () => {
    const pipe = new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    await expect(
      pipe.transform(
        {
          password: 'password',
          code: '123456',
          auditDays: 1,
          reminderDays: 0,
          exportDays: 0,
        },
        { type: 'body', metatype: RetentionPolicyDto },
      ),
    ).rejects.toThrow();
    await expect(
      pipe.transform(
        {
          password: 'password',
          code: '123456',
          confirmation: 'yes',
          planId: '123e4567-e89b-12d3-a456-426614174000',
        },
        { type: 'body', metatype: RetentionPurgeDto },
      ),
    ).rejects.toThrow();
    await expect(
      pipe.transform(
        {
          password: 'password',
          code: '123456',
          from: '2026-10-01T00:00:00Z',
          to: '2026-10-02T00:00:00Z',
          includePasswords: true,
        },
        { type: 'body', metatype: AdminExportDto },
      ),
    ).rejects.toThrow();
  });
});
