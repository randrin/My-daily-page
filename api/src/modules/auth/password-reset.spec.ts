import { DataSource } from 'typeorm';
import { Queue, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PasswordResetService, resetHash } from './password-reset.service';
import { PasswordResetWorker } from './password-reset.worker';
import { EmailProvider } from '../notifications/providers/email.provider';

describe('Password recovery', () => {
  it('returns the same acceptance and deduplicates normalized addresses', async () => {
    const queue = {
      add: jest
        .fn<Promise<unknown>, [string, { email: string }, { jobId: string }]>()
        .mockResolvedValue({}),
    };
    const service = new PasswordResetService(
      {} as DataSource,
      queue as unknown as Queue,
    );
    jest.spyOn(Date, 'now').mockReturnValue(1800000000000);
    await expect(service.request(' USER@EXAMPLE.COM ')).resolves.toEqual({
      accepted: true,
    });
    await service.request('user@example.com');
    expect(queue.add.mock.calls[0]).toEqual(queue.add.mock.calls[1]);
    expect(queue.add.mock.calls[0][2].jobId).not.toContain('user@');
    jest.restoreAllMocks();
  });
  it('rejects invalid, expired or already consumed tokens without updating passwords', async () => {
    for (const responses of [[[]], [[{ id: 'user' }], []]]) {
      const query = jest.fn<Promise<unknown[]>, [string, string[]]>();
      responses.forEach((response) => query.mockResolvedValueOnce(response));
      const db = {
        transaction: (
          callback: (manager: { query: typeof query }) => Promise<void>,
        ) => callback({ query }),
      };
      const service = new PasswordResetService(
        db as unknown as DataSource,
        {} as Queue,
      );
      await expect(
        service.reset('a'.repeat(64), 'new-password'),
      ).rejects.toThrow('invalide');
      expect(
        query.mock.calls.some((call) =>
          String(call[0]).includes('UPDATE users SET password'),
        ),
      ).toBe(false);
    }
  });
  it('hashes the token and password and revokes refresh tokens after success', async () => {
    const query = jest
      .fn<Promise<unknown[]>, [string, string[]]>()
      .mockResolvedValue([{ id: 'user' }]);
    const db = {
      transaction: (
        callback: (manager: { query: typeof query }) => Promise<void>,
      ) => callback({ query }),
    };
    await new PasswordResetService(
      db as unknown as DataSource,
      {} as Queue,
    ).reset('a'.repeat(64), 'new-password');
    expect(query.mock.calls[0][1]).toEqual([resetHash('a'.repeat(64))]);
    const passwordCall = query.mock.calls.find((call) =>
      String(call[0]).startsWith('UPDATE users SET password'),
    );
    expect(passwordCall?.[1][0]).toMatch(/^\$2/);
    expect(
      query.mock.calls.some((call) =>
        String(call[0]).includes('UPDATE refresh_tokens'),
      ),
    ).toBe(true);
  });
  it('does not send emails for unknown addresses', async () => {
    const query = jest
      .fn<Promise<unknown[]>, [string, string[]]>()
      .mockResolvedValue([]);
    const db = {
      transaction: (
        callback: (manager: { query: typeof query }) => Promise<unknown>,
      ) => callback({ query }),
    };
    const email = { send: jest.fn() };
    await new PasswordResetWorker(
      db as unknown as DataSource,
      new ConfigService(),
      email as unknown as EmailProvider,
    ).process({ data: { email: 'unknown@example.com' } } as Job<{
      email: string;
    }>);
    expect(email.send).not.toHaveBeenCalled();
  });
  it('sends a client reset CTA and stores only the token hash', async () => {
    const query = jest
      .fn<Promise<unknown[]>, [string, string[]]>()
      .mockResolvedValueOnce([{ id: 'user', email: 'user@example.com' }])
      .mockResolvedValueOnce([])
      .mockResolvedValue([]);
    const db = {
      transaction: (
        callback: (manager: { query: typeof query }) => Promise<unknown>,
      ) => callback({ query }),
    };
    const email = {
      send: jest
        .fn<Promise<unknown>, [string, string, string, string?]>()
        .mockResolvedValue({}),
    };
    await new PasswordResetWorker(
      db as unknown as DataSource,
      new ConfigService({ notifications: { appUrl: 'https://example.com' } }),
      email as unknown as EmailProvider,
    ).process({ data: { email: 'user@example.com' } } as Job<{
      email: string;
    }>);
    const body = String(email.send.mock.calls[0][2]);
    const token = /token=([a-f0-9]{64})/.exec(body)?.[1];
    expect(token).toBeDefined();
    expect(body).toContain('https://example.com/auth/reset.password');
    expect(query.mock.calls[3][1][1]).toBe(resetHash(token));
  });
});
