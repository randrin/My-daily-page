import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

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
      accountSid && authToken ? twilio(accountSid, authToken) : null;
  }

  async send(to: string, body: string): Promise<void> {
    if (!this.client || !this.fromNumber) {
      this.logger.warn(
        'Twilio WhatsApp not configured — skipping WhatsApp send',
      );
      return;
    }

    const recipient = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    await this.client.messages.create({
      body,
      from: this.fromNumber,
      to: recipient,
    });
  }
}
