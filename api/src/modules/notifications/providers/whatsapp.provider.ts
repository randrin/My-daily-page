import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { DeliveryReceipt } from '../delivery.service';
import * as twilio from 'twilio';

@Injectable()
export class WhatsappProvider {
  private readonly logger = new Logger(WhatsappProvider.name);
  private readonly client: ReturnType<typeof twilio> | null;
  private readonly fromNumber: string | undefined;

  constructor(private readonly config: ConfigService) {
    const accountSid = this.config.get<string>('twilio.accountSid');
    const authToken = this.config.get<string>('twilio.authToken');
    this.fromNumber = this.config.get<string>('twilio.whatsappNumber');
    this.client =
      (this.config.get<string>('whatsapp.provider') ?? 'twilio') === 'twilio' &&
      accountSid &&
      authToken
        ? twilio(accountSid, authToken)
        : null;
  }

  async send(
    to: string,
    body: string,
    donePayload?: string,
  ): Promise<DeliveryReceipt> {
    const provider = this.config.get<string>('whatsapp.provider') ?? 'twilio';
    if (provider === 'ultramsg') return this.sendUltraMsg(to, body);
    if (provider !== 'twilio') throw new Error('Unknown WhatsApp provider');
    if (!this.client || !this.fromNumber) {
      throw new Error('Twilio whatsapp is not configured');
    }

    const recipient = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    const quickReplySid = this.config.get<string>(
      'twilio.whatsappQuickReplySid',
    );
    const contentSid =
      quickReplySid && donePayload
        ? quickReplySid
        : this.config.get<string>('twilio.whatsappContentSid');
    if (!contentSid)
      throw new Error('Twilio WhatsApp approved template is not configured');
    const message = await this.client.messages.create({
      contentSid,
      ...(this.config.get<string>('twilio.statusCallbackUrl')
        ? {
            statusCallback: this.config.get<string>('twilio.statusCallbackUrl'),
          }
        : {}),
      contentVariables: JSON.stringify({
        '1': quickReplySid && donePayload ? body.slice(0, 1024) : body,
        ...(quickReplySid && donePayload ? { '2': donePayload } : {}),
      }),
      from: this.fromNumber,
      to: recipient,
    });
    return { provider: 'twilio', messageId: message.sid };
  }

  private async sendUltraMsg(
    to: string,
    body: string,
  ): Promise<DeliveryReceipt> {
    const instanceId = this.config.get<string>('ultramsg.instanceId')?.trim();
    const token = this.config.get<string>('ultramsg.token')?.trim();
    if (!instanceId || !/^instance\d+$/.test(instanceId) || !token)
      throw new Error(
        'UltraMsg WhatsApp is not configured: check ULTRAMSG_INSTANCE_ID and ULTRAMSG_TOKEN',
      );
    const recipient = to.replace(/^whatsapp:/, '');
    if (!/^\+[1-9]\d{7,14}$/.test(recipient))
      throw new Error('UltraMsg requires an international phone number');
    if (!body.trim() || body.length > 4096)
      throw new Error(
        'UltraMsg message must contain between 1 and 4096 characters',
      );
    let response: Response;
    try {
      response = await fetch(
        `https://api.ultramsg.com/${instanceId}/messages/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ token, to: recipient, body }).toString(),
          signal: AbortSignal.timeout(15000),
          redirect: 'error',
        },
      );
    } catch {
      // An interrupted request may have been accepted. The worker must not resend blindly.
      throw Object.assign(
        new Error(
          'UltraMsg connection interrupted; verify delivery with provider',
        ),
        { code: 'ECONNRESET' },
      );
    }
    if (!response.ok) {
      const error = new Error(
        `UltraMsg request failed (HTTP ${response.status})`,
      );
      if (response.status >= 500) Object.assign(error, { code: 'ECONNRESET' });
      throw error;
    }
    let result: {
      sent?: boolean | string;
      id?: string | number;
      error?: unknown;
    };
    try {
      result = (await response.json()) as typeof result;
    } catch {
      throw Object.assign(
        new Error(
          'UltraMsg response unreadable; verify delivery with provider',
        ),
        { code: 'ECONNRESET' },
      );
    }
    if (result && result.error)
      throw new Error(
        'UltraMsg rejected the message; check instance, token and recipient in UltraMsg',
      );
    if (!result || ![true, 'true'].includes(result.sent ?? false) || !result.id)
      throw Object.assign(
        new Error(
          'UltraMsg acceptance could not be confirmed; verify delivery with provider',
        ),
        { code: 'ECONNRESET' },
      );
    return { provider: 'ultramsg', messageId: String(result.id) };
  }
}
