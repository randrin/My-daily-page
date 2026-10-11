import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
export type DeliveryReceipt = { provider: string; messageId: string };
export function deliveryState(
  status: string,
): { status: string; rank: number } | undefined {
  const states: Record<string, [string, number]> = {
    queued: ['accepted', 1],
    accepted: ['accepted', 1],
    sending: ['accepted', 1],
    sent: ['sent', 2],
    delivered: ['delivered', 4],
    read: ['read', 5],
    failed: ['failed', 3],
    undelivered: ['failed', 3],
    'email.sent': ['sent', 2],
    'email.delivered': ['delivered', 4],
    'email.bounced': ['failed', 3],
    'email.failed': ['failed', 3],
    'email.complained': ['complained', 6],
  };
  const value = states[status];
  return value ? { status: value[0], rank: value[1] } : undefined;
}
@Injectable()
export class DeliveryService {
  constructor(private readonly source: DataSource) {}
  async bind(reminderId: string, receipt: DeliveryReceipt) {
    await this.source.query(
      `UPDATE reminders SET provider=$2, provider_message_id=$3, delivery_status='accepted' WHERE id=$1`,
      [reminderId, receipt.provider, receipt.messageId],
    );
    await this.refresh(receipt.provider, receipt.messageId);
  }
  async event(
    provider: string,
    eventId: string,
    messageId: string,
    status: string,
    error?: string,
  ) {
    const state = deliveryState(status);
    if (!state) return;
    await this.source.query(
      `INSERT INTO notification_delivery_events(provider,event_id,message_id,status,rank,error) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
      [
        provider,
        eventId,
        messageId,
        state.status,
        state.rank,
        error?.slice(0, 200) ?? null,
      ],
    );
    await this.refresh(provider, messageId);
  }
  async refresh(provider: string, messageId: string) {
    // Serialize replay, receipt binding and out-of-order callbacks for the same message.
    await this.source.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
        `delivery-${provider}-${messageId}`,
      ]);
      const events = await manager.query<
        { status: string; error: string | null }[]
      >(
        `SELECT status,error FROM notification_delivery_events WHERE provider=$1 AND message_id=$2 ORDER BY rank DESC, created_at DESC LIMIT 1`,
        [provider, messageId],
      );
      if (!events[0]) return;
      await manager.query(
        `UPDATE reminders SET delivery_status=$3::varchar,delivery_error=$4, last_error=CASE WHEN $3::varchar IN ('sent','delivered','read','complained') THEN NULL ELSE last_error END, status=CASE WHEN $3::varchar IN ('sent','delivered','read','complained') THEN 'SENT' ELSE status END, sent_at=CASE WHEN $3::varchar IN ('sent','delivered','read','complained') THEN COALESCE(sent_at,now()) ELSE sent_at END WHERE provider=$1 AND provider_message_id=$2`,
        [provider, messageId, events[0].status, events[0].error],
      );
      await manager.query(
        `UPDATE sms_overflow_digests SET delivery_status=$3::varchar,status=CASE WHEN $3::varchar IN ('sent','delivered','read','complained') THEN 'accepted' ELSE status END WHERE provider=$1 AND provider_message_id=$2`,
        [provider, messageId, events[0].status],
      );
    });
  }
}
