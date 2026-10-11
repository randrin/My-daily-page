import { UltraMsgDeliveryService } from './ultramsg-delivery.service';
import {
  Body,
  Controller,
  ForbiddenException,
  Headers,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { timingSafeEqual } from 'crypto';
import * as twilio from 'twilio';
import type { Response } from 'express';
import { NotifChannel } from '@entities/enums';
import { InboundService } from './inbound.service';

@ApiTags('notification-webhooks')
@Controller('notification-webhooks')
export class InboundController {
  constructor(
    private readonly config: ConfigService,
    private readonly inbound: InboundService,
    private readonly ultraDelivery?: UltraMsgDeliveryService,
  ) {}
  @Post('twilio')
  @ApiOperation({ summary: 'Réponses SMS/WhatsApp signées par Twilio' })
  async twilio(
    @Body() body: Record<string, string>,
    @Headers('x-twilio-signature') signature: string,
    @Res() response: Response,
  ) {
    const secret = this.config.get<string>('twilio.authToken');
    const url = this.config.get<string>('twilio.inboundUrl');
    if (
      !secret ||
      !url ||
      !signature ||
      !twilio.validateRequest(secret, signature, url, body) ||
      body.AccountSid !== this.config.get<string>('twilio.accountSid')
    )
      throw new ForbiddenException('Invalid webhook signature');
    if (
      !/^SM[a-f0-9]{32}$/i.test(body.MessageSid ?? '') ||
      typeof body.From !== 'string' ||
      typeof body.Body !== 'string'
    )
      throw new ForbiddenException('Invalid event');
    const channel = body.From.startsWith('whatsapp:')
      ? NotifChannel.WHATSAPP
      : NotifChannel.SMS;
    const result = await this.inbound.receive(
      'twilio',
      body.MessageSid,
      body.From,
      channel,
      (body.ButtonPayload || body.Body).slice(0, 200),
    );
    const xml = new twilio.twiml.MessagingResponse();
    xml.message(result);
    response.type('text/xml').send(xml.toString());
  }
  @Post('ultramsg')
  @ApiOperation({
    summary: 'Réponses UltraMsg avec secret dédié dans l’URL HTTPS',
  })
  async ultramsg(
    @Query('secret') provided: string,
    @Body()
    body: {
      event_type?: string;
      instanceId?: string | number;
      data?: {
        id?: string;
        from?: string;
        body?: string;
        fromMe?: boolean;
        type?: string;
      };
    },
  ) {
    const secret = this.config.get<string>('ultramsg.webhookSecret');
    if (
      !secret ||
      secret.length < 32 ||
      typeof provided !== 'string' ||
      Buffer.byteLength(secret) !== Buffer.byteLength(provided) ||
      !timingSafeEqual(Buffer.from(secret), Buffer.from(provided))
    )
      throw new ForbiddenException('Invalid webhook secret');
    if (
      `instance${body.instanceId}` !==
      this.config.get<string>('ultramsg.instanceId')
    )
      throw new ForbiddenException('Invalid instance');
    if (body.event_type === 'message_ack') {
      await this.ultraDelivery?.reconcile();
      return { received: true };
    }
    if (
      body.event_type !== 'message_received' ||
      body.data?.fromMe !== false ||
      body.data.type !== 'chat'
    )
      return { ignored: true };
    const data = body.data;
    if (
      typeof data.id !== 'string' ||
      data.id.length > 200 ||
      typeof data.from !== 'string' ||
      !/^\d{8,15}@c\.us$/.test(data.from) ||
      typeof data.body !== 'string'
    )
      return { ignored: true };
    return {
      result: await this.inbound.receive(
        'ultramsg',
        data.id,
        `+${data.from.split('@')[0]}`,
        NotifChannel.WHATSAPP,
        data.body.slice(0, 200),
      ),
    };
  }
}
