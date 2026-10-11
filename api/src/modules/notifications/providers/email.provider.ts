import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { DeliveryReceipt } from '../delivery.service';
import { Resend } from 'resend';

@Injectable()
export class EmailProvider {
  private readonly logger = new Logger(EmailProvider.name);
  private readonly resend: Resend | null;
  private readonly fromEmail: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('resend.apiKey');
    this.fromEmail =
      this.config.get<string>('resend.fromEmail') ?? 'onboarding@resend.dev';
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  async send(
    to: string,
    subject: string,
    body: string,
    idempotencyKey?: string,
  ): Promise<DeliveryReceipt> {
    if (!this.resend) {
      throw new Error('Resend is not configured');
    }

    const { data, error } = await this.resend.emails.send(
      {
        from: this.fromEmail,
        to,
        subject,
        html: body,
      },
      { idempotencyKey },
    );

    if (error) {
      throw Object.assign(
        new Error(error.message),
        error.name === 'application_error' ? { code: 'ECONNRESET' } : {},
      );
    }
    if (!data?.id)
      throw Object.assign(new Error('Resend acceptance missing message id'), {
        code: 'ECONNRESET',
      });
    return { provider: 'resend', messageId: data.id };
  }
}
