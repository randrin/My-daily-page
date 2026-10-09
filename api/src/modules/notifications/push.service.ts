import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as webpush from 'web-push';
import { PushSubscription } from '@entities/push-subscription.entity';
import { NotificationPreference } from '@entities/notification-preference.entity';
import { NotifChannel } from '@entities/enums';
import { PushSubscriptionDto } from './dto/push-subscription.dto';

export function isTrustedPushEndpoint(endpoint: string) {
  try {
    const url = new URL(endpoint);
    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      (!url.port || url.port === '443') &&
      [
        'fcm.googleapis.com',
        'updates.push.services.mozilla.com',
        'web.push.apple.com',
      ].some(
        (host) =>
          url.hostname === host ||
          (host === 'updates.push.services.mozilla.com' &&
            url.hostname.endsWith(`.${host}`)),
      )
    );
  } catch {
    return false;
  }
}
@Injectable()
export class PushService {
  constructor(
    private readonly source: DataSource,
    private readonly config: ConfigService,
  ) {}
  publicKey() {
    return this.config.get<string>('push.privateKey') &&
      this.config.get<string>('push.subject')
      ? (this.config.get<string>('push.publicKey') ?? null)
      : null;
  }
  async subscribe(userId: string, dto: PushSubscriptionDto) {
    if (!this.publicKey())
      throw new BadRequestException(
        'Les notifications push ne sont pas configurées',
      );
    if (!dto.keys || !isTrustedPushEndpoint(dto.endpoint))
      throw new BadRequestException('Service push non autorisé');
    return this.source.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
        dto.endpoint,
      ]);
      const old = await manager.findOneBy(PushSubscription, {
        endpoint: dto.endpoint,
      });
      if (old && old.userId !== userId)
        throw new ConflictException(
          'Cet appareil est associé à un autre compte. Désactive ses notifications avant de changer de compte.',
        );
      await manager.save(
        PushSubscription,
        manager.create(PushSubscription, {
          ...old,
          userId,
          endpoint: dto.endpoint,
          p256dh: dto.keys.p256dh,
          auth: dto.keys.auth,
        }),
      );
      await manager.upsert(
        NotificationPreference,
        { userId, channel: NotifChannel.PUSH, enabled: true },
        ['userId', 'channel'],
      );
      return { enabled: true };
    });
  }
  async remove(userId: string, endpoint: string) {
    await this.source
      .getRepository(PushSubscription)
      .delete({ userId, endpoint });
    return { removed: true };
  }
  async send(
    userId: string,
    payload: { title: string; body: string; url: string; tag: string },
  ) {
    if (!this.publicKey()) throw new Error('Web push is not configured');
    const repo = this.source.getRepository(PushSubscription);
    const subscriptions = await repo.findBy({ userId });
    if (!subscriptions.length)
      throw new Error('Aucun appareil abonné aux notifications push');
    let accepted = 0;
    for (const subscription of subscriptions) {
      if (!isTrustedPushEndpoint(subscription.endpoint)) continue;
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify(payload),
          {
            TTL: 3600,
            timeout: 15000,
            vapidDetails: {
              subject: this.config.get<string>('push.subject'),
              publicKey: this.publicKey(),
              privateKey: this.config.get<string>('push.privateKey'),
            },
          },
        );
        accepted++;
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410)
          await repo.delete(subscription.id);
        // Never retry an already partially accepted broadcast blindly.
      }
    }
    if (!accepted)
      throw Object.assign(
        new Error('Envoi push non confirmé ; vérifier les abonnements'),
        { code: 'ECONNRESET' },
      );
  }
}
