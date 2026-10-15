import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import dataSource from '../../database/data-source';
import { User } from '@entities/user.entity';
import { RefreshToken } from '@entities/refresh-token.entity';
import { AuthService } from './auth.service';
const integration =
  process.env.LOCALE_DATABASE_TESTS === '1' ? describe : describe.skip;
integration('Language preference persistence', () => {
  it('defaults to French and saves English for the current account only', async () => {
    await dataSource.initialize();
    const runner = dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const id = randomUUID(),
        other = randomUUID();
      await runner.query(
        "INSERT INTO users(id,email,password,notifications_enabled) VALUES($1,$2,'unused',false),($3,$4,'unused',false)",
        [id, id + '@example.invalid', other, other + '@example.invalid'],
      );
      const repo = runner.manager.getRepository(User);
      const auth = new AuthService(
        repo,
        {} as Repository<RefreshToken>,
        {} as JwtService,
        {} as ConfigService,
      );
      expect((await repo.findOneByOrFail({ id })).locale).toBe('fr');
      await auth.updateProfile(id, { locale: 'en' });
      expect((await repo.findOneByOrFail({ id })).locale).toBe('en');
      expect((await repo.findOneByOrFail({ id: other })).locale).toBe('fr');
    } finally {
      await runner.rollbackTransaction();
      await runner.release();
      await dataSource.destroy();
    }
  });
});
