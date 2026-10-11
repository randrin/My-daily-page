import {
  Body,
  Controller,
  ForbiddenException,
  Headers,
  HttpCode,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import * as twilio from 'twilio';
import { Webhook } from 'svix';
import { DeliveryService } from './delivery.service';

@ApiTags('notification-webhooks')
@Controller('notification-webhooks')
export class DeliveryController {
  constructor(
    private readonly config: ConfigService,
    private readonly delivery: DeliveryService,
  ) {}
  @ApiOperation({ summary: 'Statuts de livraison Twilio authentifiés' })
  @Post('twilio/status')
  @HttpCode(204)
  async twilioStatus(
    @Body() body: Record<string, string>,
    @Headers('x-twilio-signature') signature: string,
  ) {
    const token = this.config.get<string>('twilio.authToken');
    const url = this.config.get<string>('twilio.statusCallbackUrl');
    if (
      !token ||
      !url ||
      !signature ||
      body.AccountSid !== this.config.get<string>('twilio.accountSid') ||
      !twilio.validateRequest(token, signature, url, body)
    )
      throw new ForbiddenException('Invalid webhook signature');
    if (
      !/^SM[a-f0-9]{32}$/i.test(body.MessageSid ?? '') ||
      typeof body.MessageStatus !== 'string'
    )
      throw new ForbiddenException('Invalid event');
    await this.delivery.event(
      'twilio',
      `${body.MessageSid}-${body.MessageStatus}`,
      body.MessageSid,
      body.MessageStatus,
      body.ErrorCode,
    );
  }
  @ApiOperation({ summary: 'Statuts de livraison Resend signés Svix' })
  @Post('resend')
  @HttpCode(204)
  async resend(@Req() req: RawBodyRequest<Request>) {
    const secret = this.config.get<string>('resend.webhookSecret');
    const id = req.header('svix-id');
    let event: { type?: string; data?: { email_id?: string } };
    try {
      if (!secret || !id || !req.rawBody) throw new Error('Missing signature');
      event = new Webhook(secret).verify(req.rawBody.toString('utf8'), {
        'svix-id': id,
        'svix-timestamp': req.header('svix-timestamp') ?? '',
        'svix-signature': req.header('svix-signature') ?? '',
      }) as typeof event;
    } catch {
      throw new ForbiddenException('Invalid webhook signature');
    }
    if (
      typeof event?.type !== 'string' ||
      typeof event.data?.email_id !== 'string'
    )
      return;
    await this.delivery.event('resend', id, event.data.email_id, event.type);
  }
}
