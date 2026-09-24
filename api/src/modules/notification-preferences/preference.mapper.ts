import { NotificationPreference } from '@entities/notification-preference.entity';

export function toPreferenceResponse(preference: NotificationPreference) {
  return {
    id: preference.id,
    userId: preference.userId,
    channel: preference.channel.toLowerCase(),
    enabled: preference.enabled,
  };
}
