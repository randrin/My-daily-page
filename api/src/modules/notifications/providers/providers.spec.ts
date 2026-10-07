import { ConfigService } from '@nestjs/config';
import { EmailProvider } from './email.provider';
import { SmsProvider } from './sms.provider';
import { WhatsappProvider } from './whatsapp.provider';

describe('Unconfigured notification providers', () => {
  const config = {
    get: jest.fn().mockReturnValue(undefined),
  } as unknown as ConfigService;
  it('never reports success without Resend', async () => {
    await expect(
      new EmailProvider(config).send('test@example.com', 'Test', 'Test'),
    ).rejects.toThrow('not configured');
  });
  it('never reports success without SMS configuration', async () => {
    await expect(
      new SmsProvider(config).send('+33612345678', 'Test'),
    ).rejects.toThrow('not configured');
  });
  it('never reports success without WhatsApp configuration', async () => {
    await expect(
      new WhatsappProvider(config).send('+33612345678', 'Test'),
    ).rejects.toThrow('not configured');
  });
});

describe('Configured Twilio providers', () => {
  const config = new ConfigService({
    twilio: {
      accountSid: `AC${'0'.repeat(32)}`,
      authToken: 'local-test-token',
      phoneNumber: '+15005550006',
      whatsappNumber: 'whatsapp:+15005550006',
    },
  });
  it('initializes the real CommonJS SDK for SMS without sending', () => {
    expect(() => new SmsProvider(config)).not.toThrow();
  });
  it('initializes the real CommonJS SDK for WhatsApp without sending', () => {
    expect(() => new WhatsappProvider(config)).not.toThrow();
  });
});
