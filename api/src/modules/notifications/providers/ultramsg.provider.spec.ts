import { ConfigService } from '@nestjs/config';
import { WhatsappProvider } from './whatsapp.provider';

describe('UltraMsg WhatsApp', () => {
  const config = () =>
    new ConfigService({
      whatsapp: { provider: 'ultramsg' },
      ultramsg: { instanceId: 'instance123', token: 'private-test-token' },
    });
  const request = jest.fn();
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation(request);
    request.mockReset();
  });
  afterEach(() => jest.restoreAllMocks());
  it('sends encoded text using UltraMsg without Twilio credentials', async () => {
    request.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ sent: 'true', id: 123 }),
    });
    await new WhatsappProvider(config()).send(
      'whatsapp:+33612345678',
      'Rappel & échéance',
    );
    expect(request).toHaveBeenCalledTimes(1);
    const [url, options] = request.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.ultramsg.com/instance123/messages/chat');
    const body = new URLSearchParams(options.body as string);
    expect(body.get('to')).toBe('+33612345678');
    expect(body.get('body')).toBe('Rappel & échéance');
    expect(body.get('token')).toBe('private-test-token');
  });
  it('fails before making a request when configuration or recipient is invalid', async () => {
    await expect(
      new WhatsappProvider(
        new ConfigService({ whatsapp: { provider: 'ultramsg' } }),
      ).send('+33612345678', 'Test'),
    ).rejects.toThrow('not configured');
    await expect(
      new WhatsappProvider(config()).send('invalid', 'Test'),
    ).rejects.toThrow('international');
    expect(request).not.toHaveBeenCalled();
  });
  it('rejects a provider error without leaking credentials or provider response', async () => {
    request.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ error: 'private-test-token' }),
    });
    await expect(
      new WhatsappProvider(config()).send('+33612345678', 'Test'),
    ).rejects.toThrow('UltraMsg rejected');
  });
  it('marks timeout and ambiguous responses uncertain to prevent duplicate retries', async () => {
    request.mockRejectedValueOnce(new Error('timeout'));
    await expect(
      new WhatsappProvider(config()).send('+33612345678', 'Test'),
    ).rejects.toMatchObject({ code: 'ECONNRESET' });
    request.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    await expect(
      new WhatsappProvider(config()).send('+33612345678', 'Test'),
    ).rejects.toMatchObject({ code: 'ECONNRESET' });
  });
  it('fails on an unsupported provider without contacting a service', async () => {
    await expect(
      new WhatsappProvider(
        new ConfigService({ whatsapp: { provider: 'invalid' } }),
      ).send('+33612345678', 'Test'),
    ).rejects.toThrow('Unknown WhatsApp provider');
    expect(request).not.toHaveBeenCalled();
  });
});
