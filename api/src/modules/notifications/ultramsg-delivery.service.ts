import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { DeliveryService } from './delivery.service';

@Injectable()
export class UltraMsgDeliveryService implements OnModuleInit, OnModuleDestroy {
  private timer?: ReturnType<typeof setInterval>;
  private readonly logger = new Logger(UltraMsgDeliveryService.name);
  private running = false;
  constructor(
    private readonly source: DataSource,
    private readonly config: ConfigService,
    private readonly delivery: DeliveryService,
  ) {}
  onModuleInit() {
    this.timer = setInterval(() => {
      if (this.config.get<string>('whatsapp.provider') === 'ultramsg')
        void this.reconcile().catch(() =>
          this.logger.warn('UltraMsg delivery lookup unavailable'),
        );
    }, 60000);
    this.timer.unref();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
  async reconcile() {
    if (this.running) return;
    this.running = true;
    try {
      const instance = this.config.get<string>('ultramsg.instanceId');
      const token = this.config.get<string>('ultramsg.token');
      if (!instance || !/^instance\d+$/.test(instance) || !token)
        throw new Error('UltraMsg not configured');
      const rows = await this.source.query<{ provider_message_id: string }[]>(
        `SELECT DISTINCT provider_message_id FROM reminders WHERE provider='ultramsg' AND delivery_status NOT IN ('read','failed') AND sent_at > now()-interval '7 days'`,
      );
      const pending = new Set(rows.map((r) => r.provider_message_id));
      // ACK webhooks use WhatsApp IDs, whereas the send API returns numeric IDs.
      // Resolve against the authenticated provider API; never infer an ID from a phone or title.
      for (let page = 1; pending.size && page <= 10; page++) {
        const url = new URL(`https://api.ultramsg.com/${instance}/messages`);
        url.search = new URLSearchParams({
          token,
          page: String(page),
          limit: '100',
          status: 'all',
          sort: 'desc',
        }).toString();
        const response = await fetch(url, {
          signal: AbortSignal.timeout(15000),
          redirect: 'error',
        });
        if (!response.ok)
          throw new Error(
            `UltraMsg delivery lookup failed (HTTP ${response.status})`,
          );
        const body = (await response.json()) as {
          messages?: { id?: number | string; ack?: string; status?: string }[];
        };
        if (!Array.isArray(body.messages))
          throw new Error('Invalid UltraMsg delivery response');
        for (const message of body.messages) {
          const id = String(message.id);
          if (!pending.has(id)) continue;
          const state: Record<string, string> = {
            pending: 'accepted',
            server: 'sent',
            device: 'delivered',
            read: 'read',
            played: 'read',
          };
          const status =
            state[String(message.ack).toLowerCase()] ??
            (message.status === 'invalid' ? 'failed' : undefined);
          if (status)
            await this.delivery.event(
              'ultramsg',
              `${id}-${status}`,
              id,
              status,
            );
          pending.delete(id);
        }
        if (body.messages.length < 100) break;
      }
    } finally {
      this.running = false;
    }
  }
}
