import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class SmsProvider {
  private readonly logger = new Logger(SmsProvider.name);
  private readonly client: ReturnType<typeof twilio> | null;
  private readonly fromNumber: string | undefined;

  constructor(private readonly config: ConfigService) {
    const accountSid = this.config.get<string>('twilio.accountSid');
    const authToken = this.config.get<string>('twilio.authToken');
    this.fromNumber = this.config.get<string>('twilio.phoneNumber');
    this.client =
      accountSid && authToken ? twilio(accountSid, authToken) : null;
  }

  async send(to: string, body: string): Promise<void> {
    if (!this.client || !this.fromNumber) {
      throw new Error('Twilio sms is not configured');
    }

    await this.client.messages.create({
      body,
      from: this.fromNumber,
      to,
    });
  }
}
