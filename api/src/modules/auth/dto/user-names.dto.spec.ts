import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';
import { UpdateProfileDto } from './update-profile.dto';

describe('Required user names', () => {
  it('rejects clearing a profile phone but allows clearing WhatsApp', async () => {
    for (const phoneNumber of [null, '', ' ', 'abc']) {
      expect((await validate(plainToInstance(UpdateProfileDto, { phoneNumber }))).some((error) => error.property === 'phoneNumber')).toBe(true);
    }
    expect(await validate(plainToInstance(UpdateProfileDto, { phoneNumber: '+33612345678', whatsappNumber: null }))).toHaveLength(0);
  });
  it('rejects missing, blank and invalid registration phones', async () => {
    for (const phoneNumber of [undefined, null, '', ' ', 'abc']) {
      const dto = plainToInstance(RegisterDto, { email: 'test@example.com', password: 'password123', firstName: 'Marie', lastName: 'Dupont', phoneNumber });
      expect((await validate(dto)).some((error) => error.property === 'phoneNumber')).toBe(true);
    }
  });
  it('rejects missing, blank and null names at registration', async () => {
    for (const names of [{}, { firstName: ' ', lastName: 'Dupont' }, { firstName: 'Marie', lastName: null }]) {
      const dto = plainToInstance(RegisterDto, { phoneNumber: '+33612345678', email: 'test@example.com', password: 'password123', ...names });
      expect((await validate(dto)).length).toBeGreaterThan(0);
    }
  });

  it('trims valid names', async () => {
    const dto = plainToInstance(RegisterDto, { phoneNumber: '+33612345678', email: 'test@example.com', password: 'password123', firstName: ' Marie ', lastName: ' Dupont ' });
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.firstName).toBe('Marie');
  });

  it('allows partial updates but rejects clearing a name', async () => {
    expect(await validate(plainToInstance(UpdateProfileDto, { timezone: 'Europe/Paris' }))).toHaveLength(0);
    for (const value of ['', ' ', null]) {
      expect((await validate(plainToInstance(UpdateProfileDto, { firstName: value }))).length).toBeGreaterThan(0);
    }
  });
});
