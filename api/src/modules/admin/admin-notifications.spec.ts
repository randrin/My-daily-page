import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Queue } from 'bullmq';
import { AdminAuditService } from './admin-audit.service';
import { AdminNotificationsService } from './admin-notifications.service';
import { retrySafe, unitPrice } from './admin-notification-rules';
describe('Notification supervision guardrails', () => {
  const failed = {
    status: 'FAILED',
    provider_message_id: null,
    last_error: 'Resend is not configured',
    delivery_status: null,
  };
  it('allows only exact preflight failures with no acceptance or delivery receipt', () => {
    expect(retrySafe(failed)).toBe(true);
    for (const change of [
      { provider_message_id: 'accepted-id' },
      { last_error: 'Timeout' },
      { delivery_status: 'failed' },
      { status: 'SENDING' },
      { last_error: 'Delivery uncertain; verify provider' },
    ])
      expect(retrySafe({ ...failed, ...change })).toBe(false);
  });
  it('does not invent missing tariffs and accepts an explicit free tariff', () => {
    expect(unitPrice(undefined)).toBeNull();
    expect(unitPrice('')).toBeNull();
    expect(unitPrice('-1')).toBeNull();
    expect(unitPrice('Infinity')).toBeNull();
    expect(unitPrice('0')).toBe(0);
    expect(unitPrice('0.05')).toBe(0.05);
  });
  it('isolates unavailable queues from healthy queues without returning job payloads', async () => {
    const healthy = {
      name: 'healthy',
      getJobCounts: jest.fn().mockResolvedValue({ waiting: 2 }),
      getWorkersCount: jest.fn().mockResolvedValue(1),
      getJobs: jest
        .fn()
        .mockResolvedValue([{ timestamp: 1000, data: { private: 'secret' } }]),
    };
    const unavailable = {
      ...healthy,
      name: 'unavailable',
      getJobCounts: jest.fn().mockRejectedValue(new Error('Redis unavailable')),
    };
    const service = new AdminNotificationsService(
      {} as DataSource,
      new ConfigService(),
      {} as AdminAuditService,
      healthy as unknown as Queue,
      unavailable as unknown as Queue,
      healthy as unknown as Queue,
    );
    const rows = await service.queues();
    expect(rows[0]).toMatchObject({
      available: true,
      workers: 1,
      counts: { waiting: 2 },
    });
    expect(rows[1]).toMatchObject({ available: false });
    expect(JSON.stringify(rows)).not.toContain('secret');
  });
});
