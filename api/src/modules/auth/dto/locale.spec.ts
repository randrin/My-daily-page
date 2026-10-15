import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateProfileDto } from './update-profile.dto';
describe('Account language preference', () => {
  it.each(['fr', 'en'])(
    'accepts %s without other profile changes',
    async (locale) => {
      expect(
        await validate(plainToInstance(UpdateProfileDto, { locale })),
      ).toHaveLength(0);
    },
  );
  it('rejects unsupported languages', async () => {
    expect(
      (
        await validate(plainToInstance(UpdateProfileDto, { locale: 'de' }))
      ).some((error) => error.property === 'locale'),
    ).toBe(true);
  });
});
