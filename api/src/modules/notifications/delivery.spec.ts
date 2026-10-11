import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import * as twilio from 'twilio';
import { DeliveryController } from './delivery.controller';
import { DeliveryService, deliveryState } from './delivery.service';
import { overflowEmail } from './sms-overflow';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';

describe('Delivery webhooks', () => {
  const event = jest.fn();
  const url = 'https://api.example.com/notification-webhooks/twilio/status';
  const secret = `whsec_${Buffer.from('local-test-secret-1234567890').toString('base64')}`;
  const config = new ConfigService({
    twilio: {
      authToken: 'test-token',
      accountSid: `AC${'a'.repeat(32)}`,
      statusCallbackUrl: url,
    },
    resend: { webhookSecret: secret },
  });
  const controller = new DeliveryController(config, {
    event,
  } as unknown as DeliveryService);
  beforeEach(() => event.mockReset());
  it('accepts signed Twilio delivery and rejects tampering', async () => {
    const body = {
      AccountSid: `AC${'a'.repeat(32)}`,
      MessageSid: `SM${'b'.repeat(32)}`,
      MessageStatus: 'delivered',
    };
    const signature = twilio.getExpectedTwilioSignature(
      'test-token',
      url,
      body,
    );
    await controller.twilioStatus(body, signature);
    expect(event).toHaveBeenCalledWith(
      'twilio',
      `${body.MessageSid}-delivered`,
      body.MessageSid,
      'delivered',
      undefined,
    );
    await expect(
      controller.twilioStatus({ ...body, MessageStatus: 'read' }, signature),
    ).rejects.toThrow('Invalid webhook signature');
  });
  const request = (
    raw: string,
    timestamp = String(Math.floor(Date.now() / 1000)),
  ) => {
    const id = 'msg_test';
    const sig = createHmac('sha256', Buffer.from(secret.slice(6), 'base64'))
      .update(`${id}.${timestamp}.${raw}`)
      .digest('base64');
    const headers: Record<string, string> = {
      'svix-id': id,
      'svix-timestamp': timestamp,
      'svix-signature': `v1,${sig}`,
    };
    return {
      rawBody: Buffer.from(raw),
      header: (key: string) => headers[key],
    } as RawBodyRequest<Request>;
  };
  it('validates raw Resend payload and blocks expired/reformatted signatures', async () => {
    const raw = JSON.stringify({
      type: 'email.delivered',
      data: { email_id: 'email-test' },
    });
    await controller.resend(request(raw));
    expect(event).toHaveBeenCalledWith(
      'resend',
      'msg_test',
      'email-test',
      'email.delivered',
    );
    await expect(controller.resend(request(raw, '1'))).rejects.toThrow(
      'Invalid webhook signature',
    );
    const modified = request(raw);
    modified.rawBody = Buffer.from(raw + ' ');
    await expect(controller.resend(modified)).rejects.toThrow(
      'Invalid webhook signature',
    );
  });
  it('orders delivery/read above stale callbacks and keeps failure distinct from acceptance', () => {
    expect(deliveryState('delivered').rank).toBeGreaterThan(
      deliveryState('sent').rank,
    );
    expect(deliveryState('read').rank).toBeGreaterThan(
      deliveryState('delivered').rank,
    );
    expect(deliveryState('email.bounced').status).toBe('failed');
    expect(deliveryState('unknown')).toBeUndefined();
  });
  it('escapes digest content and provides one task CTA per item', () => {
    const html = overflowEmail(
      [
        {
          reminder_id: 'r',
          task_id: 'task',
          title: '<script> & task',
          deadline: null,
        },
      ],
      '2026-10-09',
      'https://app.example.com',
      'Europe/Paris',
    );
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('/dashboard/tasks');
  });
});
