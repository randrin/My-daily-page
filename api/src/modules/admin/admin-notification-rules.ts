// Exact preflight errors only. Never retry an ambiguous network/provider failure.
export const retryableErrors = [
  'Twilio sms is not configured',
  'Twilio whatsapp is not configured',
  'Twilio WhatsApp approved template is not configured',
  'UltraMsg WhatsApp is not configured: check ULTRAMSG_INSTANCE_ID and ULTRAMSG_TOKEN',
  'Resend is not configured',
  'Push provider unavailable',
  'SMS requires a phone number',
  'WhatsApp requires a number',
  'Unknown WhatsApp provider',
  'UltraMsg requires an international phone number',
];
export function retrySafe(row: {
  status: string;
  provider_message_id: string | null;
  last_error: string | null;
  delivery_status: string | null;
}) {
  return (
    row.status === 'FAILED' &&
    !row.provider_message_id &&
    !row.delivery_status &&
    retryableErrors.includes(row.last_error ?? '')
  );
}
export function unitPrice(raw: unknown): number | null {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
