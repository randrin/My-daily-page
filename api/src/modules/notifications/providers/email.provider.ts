import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailProvider {
  private readonly logger = new Logger(EmailProvider.name);
  private readonly resend: Resend | null;
  private readonly fromEmail: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('resend.apiKey');
    this.fromEmail = this.config.get<string>('resend.fromEmail');
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  async send(to: string, subject: string, body: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured — skipping email send');
      return;
    }

    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject,
      html: body,
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}
