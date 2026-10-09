import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';
import { reminderEmail } from '../../notifications/reminder-email';

describe('financial task details', () => {
  const base = { title: 'Invoice', deadline: '2099-01-01T09:00:00Z' };
  it('accepts zero, decimals and explicit clearing', async () => {
    for (const amount of ['0', '125.50', null])
      expect(
        await validate(
          plainToInstance(CreateTaskDto, {
            ...base,
            amount,
            currency: 'EUR',
            reference: null,
          }),
        ),
      ).toHaveLength(0);
  });
  it('rejects negative, overflow, fractional precision and unknown currencies', async () => {
    for (const amount of ['-1', '10000000000', '12.345'])
      expect(
        (await validate(plainToInstance(CreateTaskDto, { ...base, amount })))
          .length,
      ).toBeGreaterThan(0);
    expect(
      (
        await validate(
          plainToInstance(CreateTaskDto, { ...base, currency: null }),
        )
      ).length,
    ).toBeGreaterThan(0);
  });
  it('escapes the reference and attachment URL and rejects dangerous attachment schemes', () => {
    const email = {
      title: 'Invoice',
      deadline: null,
      timezone: 'UTC',
      actionUrl: 'https://example.com/done',
      appUrl: 'https://example.com',
      amount: '125.50',
      currency: 'EUR',
      reference: '<script>alert(1)</script>',
    };
    const html = reminderEmail({
      ...email,
      imageUrl: 'https://example.com/file?a=1&b=2',
    });
    expect(html).toContain('125,50');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('Voir la pièce jointe');
    expect(html).toContain('file?a=1&amp;b=2');
    expect(
      reminderEmail({ ...email, imageUrl: 'javascript:alert(1)' }),
    ).not.toContain('Voir la pièce jointe');
  });
});
